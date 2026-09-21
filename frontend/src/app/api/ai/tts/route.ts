import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        // Call Groq audio endpoint with model canopylabs/orpheus-v1-english
        const ttsResponse = await fetch("https://api.groq.com/openai/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "canopylabs/orpheus-v1-english",
            input: text.slice(0, 500),
            voice: "neutral",
            response_format: "mp3",
          }),
        });

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength.toString(),
            },
          });
        }
      } catch (e) {
        console.warn("Groq TTS error, signaling browser speech synthesis fallback:", e);
      }
    }

    // Signal client to use browser speech synthesis fallback
    return NextResponse.json({
      fallback: true,
      message: "Use browser Web Speech Synthesis",
      text,
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ fallback: true, text: "" });
  }
}
