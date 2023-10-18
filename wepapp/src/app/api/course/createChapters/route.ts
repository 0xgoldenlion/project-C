import { createChaptersSchema } from "@/validators/course";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json()
        const {title, units} = createChaptersSchema.parse(body)
        
    } catch (error) {
        if (error instanceof ZodError) {
            return new NextResponse("invalid body", {status:400})
        }
    }
}