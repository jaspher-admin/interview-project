import { NextResponse } from "next/server";
import { getServerSupabase, getAllClients } from "@/lib/supabase-server";
import { clientFormSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clients = await getAllClients();
    return NextResponse.json({ clients });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = clientFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      company_name: input.company_name,
      employee_count: input.employee_count,
      annual_revenue: input.annual_revenue,
      industry: input.industry,
      states: input.states,
      description: input.description?.length ? input.description : null,
      notes: input.notes?.length ? input.notes : null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
