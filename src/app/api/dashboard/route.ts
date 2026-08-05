import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET() {
  const session = driver.session();

  try {
    const openBugs = await session.run(`
      MATCH (b:Bug)
      WHERE b.status = 'Open'
      RETURN count(b) AS count
    `);

    const services = await session.run(`
      MATCH (s:Service)
      RETURN count(s) AS count
    `);

    const developers = await session.run(`
      MATCH (d:Developer)
      RETURN count(d) AS count
    `);

    const customers = await session.run(`
      MATCH (c:Customer)
      RETURN count(c) AS count
    `);

    return NextResponse.json({
      openBugs: Number(openBugs.records[0].get("count")),
      services: Number(services.records[0].get("count")),
      developers: Number(developers.records[0].get("count")),
      customers: Number(customers.records[0].get("count")),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load dashboard" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}