import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side client (uses same anon key — fine for this demo project)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tickets: data });
}

export async function POST(req) {
  const body = await req.json();
  const { user_query, category, priority, ai_response, status } = body;

  const { data, error } = await supabase
    .from("tickets")
    .insert([{ user_query, category, priority, ai_response, status: status || "open" }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ticket: data[0] });
}
