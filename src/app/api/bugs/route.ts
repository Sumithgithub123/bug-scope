import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (b:Bug)-[:AFFECTS]->(:API)-[:BELONGS_TO]->(s:Service)
      OPTIONAL MATCH (s)-[:OWNED_BY]->(t:Team)
      OPTIONAL MATCH (s)-[:CALLS*0..5]->(affected:Service)

      WITH
        b,
        s,
        t,
        count(DISTINCT affected) + 1 AS affectedServices

      RETURN
        b.id AS id,
        b.title AS title,
        b.severity AS severity,
        b.status AS status,
        s.name AS service,
        t.name AS team,
        affectedServices
    `);

    const bugs = result.records.map((record) => {
      const affectedServices = Number(record.get("affectedServices"));

      const impact = Math.min(
        100,
        Math.round(affectedServices * 8)
      );

      return {
        id: record.get("id"),
        title: record.get("title"),
        severity: record.get("severity"),
        status: record.get("status"),
        service: record.get("service"),
        team: record.get("team"),
        impact,
      };
    });

    return NextResponse.json(bugs);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Failed to load bugs." },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}