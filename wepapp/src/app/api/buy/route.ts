// /api/chapter/getInto

import { prisma } from "@/lib/db";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";

const bodyParser = z.object({
  chapterId: z.string(),
});

export async function GET(req: Request, res: Response) {
    const session = await getAuthSession();
    if (!session?.user) {
        return new NextResponse("unauthorised", { status: 401 });
      }
    
  try {


    await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          credits: {
            increment: 1,
          },
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid body",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "unknown",
        },
        { status: 500 }
      );
    }
  }
}