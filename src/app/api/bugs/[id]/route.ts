import { NextRequest, NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = driver.session();

  try {
    // Bug Details
    const bugResult = await session.run(
      `
      MATCH (b:Bug {id:$id})
        -[:AFFECTS]->
        (a:API)
        -[:BELONGS_TO]->
        (s:Service)
      OPTIONAL MATCH (s)-[:OWNED_BY]->(t:Team)

      RETURN
        b.id AS id,
        b.title AS title,
        b.status AS status,
        b.severity AS severity,
        a.endpoint AS api,
        s.name AS service,
        t.name AS team
      `,
      { id },
    );

    if (!bugResult.records.length) {
      return NextResponse.json({ message: "Bug not found" }, { status: 404 });
    }

    const bug = bugResult.records[0];

    // Developers
    const developerResult = await session.run(
      `
      MATCH (b:Bug {id:$id})
        -[:AFFECTS]->
        (:API)
        -[:BELONGS_TO]->
        (s:Service)
        -[:OWNED_BY]->
        (:Team)
        -[:HAS_MEMBER]->
        (d:Developer)

      RETURN DISTINCT d.name AS name
      `,
      { id },
    );

    const developers = developerResult.records
      .map((r) => r.get("name"))
      .filter(Boolean);

    // Dependencies
    const dependencyResult = await session.run(
      `
      MATCH (b:Bug {id:$id})
        -[:AFFECTS]->
        (:API)
        -[:BELONGS_TO]->
        (s:Service)

      OPTIONAL MATCH (s)-[:CALLS]->(dep:Service)

      RETURN DISTINCT dep.name AS service
      `,
      { id },
    );

    const dependencies = dependencyResult.records
      .map((r) => r.get("service"))
      .filter(Boolean);

    // Customers
    const customerResult = await session.run(
      `
      MATCH (b:Bug {id:$id})-[:AFFECTS]->(a:API)
      OPTIONAL MATCH (c:Customer)-[:USES]->(a)

      RETURN COUNT(DISTINCT c) AS customers
      `,
      { id },
    );

    const affectedCustomers = Number(
      customerResult.records[0]?.get("customers") ?? 0,
    );

    const affectedServices = dependencies.length + 1;
    const affectedDevelopers = developers.length;

    const impactScore = Math.min(
      100,
      Math.round(
        affectedServices * 8 +
          affectedDevelopers * 5 +
          affectedCustomers * 0.05,
      ),
    );

    // Graph Nodes
    const nodeResult = await session.run(
      `
  MATCH p=(b:Bug {id:$id})-[*0..4]-(n)
  UNWIND nodes(p) AS node

  RETURN DISTINCT
    node.id AS id,
    coalesce(node.name, node.title, node.endpoint) AS name,
    head(labels(node)) AS type
  `,
      { id },
    );

    const nodes = nodeResult.records.map((r) => ({
      id: r.get("id"),
      name: r.get("name"),
      type: r.get("type"),
    }));

    const nodeIds = new Set(nodes.map((n) => n.id));

    // Graph Links
    const linkResult = await session.run(`
  MATCH (a)-[r]->(b)
  WHERE a.id IS NOT NULL
    AND b.id IS NOT NULL

  RETURN
    a.id AS source,
    b.id AS target,
    type(r) AS label
`);

    const links = linkResult.records
      .map((r) => ({
        source: r.get("source"),
        target: r.get("target"),
        label: r.get("label"),
      }))
      .filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));

    return NextResponse.json({
      bug: {
        id: bug.get("id"),
        title: bug.get("title"),
        severity: bug.get("severity"),
        status: bug.get("status"),
        api: bug.get("api"),
        service: bug.get("service"),
        team: bug.get("team"),
      },

      stats: {
        impactScore,
        affectedServices,
        affectedDevelopers,
        affectedCustomers,
      },

      developers,
      dependencies,

      graph: {
        nodes,
        links,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch bug." },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
