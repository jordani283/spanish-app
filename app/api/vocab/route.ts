import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addVocabItem, getVocabByDateRange } from "@/lib/data";

const createSchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  partOfSpeech: z.enum(["verb", "noun", "adjective", "adverb", "phrase", "other"]),
  notes: z.string().optional(),
  sourceContext: z.string().optional(),
  exampleSentence: z.string().optional(),
  aiEnrichment: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end query parameter" }, { status: 400 });
  }

  const items = await getVocabByDateRange(start, end);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await addVocabItem(parsed.data);
  return NextResponse.json({ item }, { status: 201 });
}
