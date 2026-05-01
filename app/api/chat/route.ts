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

Answer questions about the client base — including aggregations (averages, totals, distributions, geographic coverage). Be precise with numbers.

FORMATTING RULES:
- Keep responses short and conversational. Lead with the answer, not a heading.
- For 2-4 data points: use a tight bullet list, no headers above it.
- For comparisons across categories: use a markdown table (will be rendered).
- Avoid H2/H3 headers (##, ###) entirely — they're visual noise for short answers.
- Avoid "Key Takeaways" sections unless the user explicitly asks for analysis. Just give the data.
- Use **bold** sparingly — only for the single most important number in the answer.
- No preamble like "Great question!" or "Based on the data...". Just answer.

Example good response to "how many industries do we have":
"4 industries across 6 clients:
- Technology — 2 (33%)
- Healthcare — 2 (33%)
- Finance — 1 (17%)
- Retail — 1 (17%)"

Example good response to "what's our average revenue":
"**$66.7M** average annual revenue across 6 clients (range: $5M–$250M)."

CLIENT DATA (n=${slim.length}):
${JSON.stringify(slim, null, 2)}`;
}
