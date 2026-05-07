import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitGrammarAttempt } from "@/lib/data";

const schema = z.object({
  questionId: z.string().min(1),
  topic: z.string().min(1),
  answer: z.string().min(1),
  expectedAnswer: z.string().min(1),
  attemptsInRound: z.number().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await submitGrammarAttempt(parsed.data);
  return NextResponse.json(result);
}
