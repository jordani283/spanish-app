import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAiConfig } from "@/lib/env";

const schema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  partOfSpeech: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fallback = {
    confidence: "low",
    cefrLevel: "B1",
    collocations: [],
    pitfalls: [],
    generatedExample: `${parsed.data.word} en contexto.`,
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ enrichment: fallback });
  }

  try {
    const { apiKey } = getOpenAiConfig();
    const prompt = `Return compact JSON only with keys: confidence,cefrLevel,collocations,pitfalls,generatedExample.
Word: ${parsed.data.word}
Translation: ${parsed.data.translation}
PartOfSpeech: ${parsed.data.partOfSpeech}
Task: Provide B1/B2 focused enrichment in Spanish. Keep generatedExample <= 14 words.`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ enrichment: fallback });
    }

    const data = (await response.json()) as {
      output_text?: string;
    };

    let enrichment = fallback;
    if (data.output_text) {
      const parsedContent = JSON.parse(data.output_text) as typeof fallback;
      enrichment = {
        ...fallback,
        ...parsedContent,
      };
    }

    return NextResponse.json({ enrichment });
  } catch {
    return NextResponse.json({ enrichment: fallback });
  }
}
