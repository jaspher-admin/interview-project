import { streamText } from "ai";
import { anthropic, CHAT_MODEL } from "@/lib/anthropic";
import { getAllClients } from "@/lib/supabase-server";
import type { Client } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: unknown };

  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clients = await getAllClients();
  const system = buildSystemPrompt(clients);

  const result = streamText({
    model: anthropic(CHAT_MODEL),
    system,
    // The AI SDK ChatRequest message shape comes from the client-side useChat hook.
    // We pass it through verbatim — its types are wider than ours, hence the cast.
    messages: messages as Parameters<typeof streamText>[0]["messages"],
  });

  return result.toDataStreamResponse();
}

function buildSystemPrompt(clients: Client[]): string {
  const slim = clients.map((c) => ({
    company_name: c.company_name,
    industry: c.industry,
    employee_count: c.employee_count,
    annual_revenue: c.annual_revenue,
    states: c.states,
    description: c.description ?? undefined,
    notes: c.notes ?? undefined,
    created_at: c.created_at,
  }));

  return `You are an analyst assistant for EXYT's client knowledge base. You have full access to the current client list below as JSON.

Answer questions about the client base — including aggregations (averages, totals, distributions by industry, geographic coverage, revenue per employee, etc.). When asked for "average demographics" or similar, compute:
- Mean and median employee count
- Mean and median annual revenue
- Industry distribution (count and %)
- State coverage (unique states represented + most common)
- Revenue per employee average

Always cite the actual numbers. If a question cannot be answered from the data provided, say so clearly. Be concise — use bullet points or short tables when listing breakdowns.

CLIENT DATA (n=${slim.length}):
${JSON.stringify(slim, null, 2)}`;
}
