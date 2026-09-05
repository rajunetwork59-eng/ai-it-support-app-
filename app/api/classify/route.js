import { NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

// Simple keyword-based fallback classifier, used if the AI call fails
// or returns something we can't parse. Keeps the demo working offline too.
function fallbackClassify(query) {
  const q = query.toLowerCase();
  if (q.includes("password") || q.includes("locked") || q.includes("login")) {
    return { category: "Password Reset / Account Lockout", priority: "High", auto_resolve: true };
  }
  if (q.includes("install") || q.includes("software") || q.includes("update")) {
    return { category: "Software Installation", priority: "Medium", auto_resolve: false };
  }
  if (q.includes("wifi") || q.includes("vpn") || q.includes("network") || q.includes("connect")) {
    return { category: "Connectivity Issue", priority: "High", auto_resolve: false };
  }
  if (q.includes("access") || q.includes("permission") || q.includes("folder")) {
    return { category: "Access Request", priority: "Medium", auto_resolve: true };
  }
  return { category: "General / Other", priority: "Low", auto_resolve: false };
}

export async function POST(req) {
  const { query } = await req.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are an IT support triage assistant for a company called TechNova Solutions.
A user submitted this support request: "${query}"

Classify it and respond ONLY with valid JSON (no markdown, no extra text) in this exact shape:
{
  "category": "one of: Password Reset / Account Lockout, Software Installation, Access Request, Connectivity Issue, System Error, Hardware Issue, General / Other",
  "priority": "one of: Critical, High, Medium, Low",
  "auto_resolve": true or false (true only for simple, low-risk requests like password resets or standard access requests),
  "suggested_response": "A short, friendly 2-3 sentence response to the user with next steps or troubleshooting advice."
}`;

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
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      data = await res.json();

      if (res.ok) break;

      const isOverloaded = data?.error?.status === "UNAVAILABLE" || res.status === 503;
      if (isOverloaded && attempt < maxAttempts) {
        console.log(`Gemini overloaded, retrying (attempt ${attempt})...`);
        await new Promise((r) => setTimeout(r, attempt * 800)); // 800ms, then 1600ms
        continue;
      }

      console.error("Gemini API error response:", JSON.stringify(data));
      throw new Error(data?.error?.message || "Gemini API request failed");
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      category: parsed.category,
      priority: parsed.priority,
      auto_resolve: !!parsed.auto_resolve,
      ai_response: parsed.suggested_response,
      source: "gemini",
    });
  } catch (err) {
    console.error("Gemini classify error:", err);
    // AI call failed or returned unparseable text — use the fallback so the demo still works.
    const fb = fallbackClassify(query);
    return NextResponse.json({
      category: fb.category,
      priority: fb.priority,
      auto_resolve: fb.auto_resolve,
      ai_response:
        "Thanks for reaching out — this has been logged and categorized. Our support team will follow up shortly.",
      source: "fallback",
    });
  }
}
