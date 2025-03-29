import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default user ID for development
const DEFAULT_USER_ID = "user_default";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      include: { case: true }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, url, type, size, caseId } = body;

    const document = await prisma.document.create({
      data: {
        title,
        url,
        type,
        size,
        userId: DEFAULT_USER_ID,
        caseId
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 