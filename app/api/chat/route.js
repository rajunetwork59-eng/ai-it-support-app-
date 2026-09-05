import { NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

export async function POST(req) {
  const { messages } = await req.json();

  if (!messages || !messages.length) {
    return NextResponse.json({ error: "messages are required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Convert our simple {role, text} messages into Gemini's format.
  // Gemini uses "user" and "model" as roles.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  const systemInstruction = {
    parts: [
      {
        text: "You are a helpful, friendly AI assistant inside an IT support app called AI IT Support Assistant for TechNova Solutions. Answer the user's questions clearly and helpfully, on any topic they ask about — not just IT issues. Keep responses concise and conversational. You do not have real-time internet access, so you cannot verify that a specific URL (e.g. a YouTube video link) currently exists or works. If asked for links to specific content (songs, videos, articles), do not invent a fake-looking URL — instead, suggest what to search for (e.g. 'search YouTube for \"song name artist\"') or give the general site name, and be upfront that you can't guarantee an exact working link.",
      },
    ],
  };

  try {
    let res, data;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents,
          systemInstruction,
        }),
      });
      data = await res.json();

      if (res.ok) break;

      const isOverloaded = data?.error?.status === "UNAVAILABLE" || res.status === 503;
      if (isOverloaded && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempt * 800));
        continue;
      }

      console.error("Gemini chat error response:", JSON.stringify(data));
      throw new Error(data?.error?.message || "Gemini API request failed");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't come up with a response. Please try again.";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { reply: "Sorry, something went wrong reaching the AI right now. Please try again in a moment." },
      { status: 200 }
    );
  }
}
