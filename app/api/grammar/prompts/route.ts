import { NextRequest, NextResponse } from "next/server";
import { getGrammarPrompts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const topic = request.nextUrl.searchParams.get("topic") ?? undefined;
  const prompts = await getGrammarPrompts(topic);
  return NextResponse.json({ prompts });
}
