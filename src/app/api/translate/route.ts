import { NextResponse } from "next/server";

interface TranslateRequest {
  text?: string;
}

function normalizeTranslatedText(raw: unknown): string {
  if (!Array.isArray(raw) || !Array.isArray(raw[0])) return "";

  const segments = raw[0]
    .map((row) => (Array.isArray(row) && typeof row[0] === "string" ? row[0] : ""))
    .filter(Boolean);

  return segments.join(" ").replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateRequest;
    const text = (body.text ?? "").trim();

    if (!text) {
      return NextResponse.json({ translation: "" }, { status: 200 });
    }

    const url =
      "https://translate.googleapis.com/translate_a/single" +
      `?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "skills-hub-translator/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ translation: "" }, { status: 502 });
    }

    const data = (await response.json()) as unknown;
    const translation = normalizeTranslatedText(data);

    return NextResponse.json({ translation }, { status: 200 });
  } catch {
    return NextResponse.json({ translation: "" }, { status: 500 });
  }
}
