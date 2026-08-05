import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET() {
  const session = driver.session();

  try {
    // Fetch all nodes
    const nodeResult = await session.run(`
      MATCH (n)
      RETURN
        n.id AS id,
        coalesce(n.name, n.title, n.endpoint) AS name,
        head(labels(n)) AS type
    `);

    const nodes = nodeResult.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      type: record.get("type"),
    }));

    // Fetch all relationships
    const linkResult = await session.run(`
      MATCH (a)-[r]->(b)
      RETURN
        a.id AS source,
        b.id AS target,
        type(r) AS label
    `);

    const links = linkResult.records.map((record) => ({
      source: record.get("source"),
      target: record.get("target"),
      label: record.get("label"),
    }));

    return NextResponse.json({
      nodes,
      links,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to load graph",
      },
      {
        status: 500,
      }
    );
  } finally {
    await session.close();
  }
}