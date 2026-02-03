import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const prompt = `
Summarize the following interview preparation material.

Return:
- 5 bullet summary
- Key concepts
- 3 interview-style questions

Content:
${text}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return NextResponse.json({
      summary: completion.choices[0].message.content,
    });
  } catch {
    return NextResponse.json(
      { error: "AI failed" },
      { status: 500 }
    );
  }
}
