import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = driver.session();

    try {
        const result = await session.run(
            `
            MATCH p=(b:Bug {id:$id})-[*1..5]-(n)
            RETURN p
            `,
            { id }
        );

        return NextResponse.json(result.records);
    } finally {
        await session.close();
    }
}