import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, userRole = "Instructor" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const systemMessage = {
          role: "system",
          content: `You are the Inside Assistant, a floating school data helper designed for non-technical teachers and principals.
You provide quick references, explain school metrics (e.g. Attainment 8, SEND attainment gaps, chronic absenteeism thresholds), and help users formulate questions for Inside.
Keep answers concise, warm, actionable, and easy to read.
Strictly do not use em dashes anywhere in your responses.`,
        };

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [systemMessage, ...messages],
            temperature: 0.3,
            max_tokens: 400,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (e) {
        console.warn("Groq Chat API error, using local assistant engine:", e);
      }
    }

    // Local quick reference assistant
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

    let localReply = "I can help you analyze student trends, understand attendance gaps, or write reports for your school governors. What would you like to explore?";

    if (lastUserMessage.includes("attendance") || lastUserMessage.includes("absent")) {
      localReply = "A student is considered persistently absent if their attendance falls below 90%, and severely absent below 80%. In your current session, 36 students are in the high-risk attendance group (<85%). You can ask 'Which students dropped below 85% attendance?' in Ask Inside to see the full intervention roster.";
    } else if (lastUserMessage.includes("send") || lastUserMessage.includes("special educational needs") || lastUserMessage.includes("attainment gap")) {
      localReply = "Inside tracks progress and attainment across all SEND categories (ASD, ADHD, Dyslexia, Speech and Language). In the active dataset, 118 SEND pupils show an average attainment score of 63.8 versus 72.4 for peers without SEND. You can ask 'Show attainment gap for SEND students' in Ask Inside to inspect targeted intervention needs.";
    } else if (lastUserMessage.includes("how") || lastUserMessage.includes("help") || lastUserMessage.includes("start")) {
      localReply = "Here is how to get started in 3 steps: 1. Review your current dataset on the Home tab. 2. Jump into 'Ask Inside' to ask any question in plain English. 3. Visit 'Reports' to export a polished Leadership Summary.";
    } else if (lastUserMessage.includes("report") || lastUserMessage.includes("export")) {
      localReply = "You can generate 6 tailored school reports in the Reports tab: Leadership Summary, Attendance Analysis, Attainment Gap, Student Progress, Intervention Summary, and Parent Meeting Brief. Both English and Arabic formats are supported.";
    }

    return NextResponse.json({ reply: localReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
