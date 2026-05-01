import { Dashboard } from "@/components/Dashboard";
import { getAllClients } from "@/lib/supabase-server";
import type { Client } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialClients: Client[] = [];
  let loadError: string | null = null;

  try {
    initialClients = await getAllClients();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load clients";
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          EXYT Client Knowledge Base
        </h1>
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Could not load clients</p>
          <p className="mt-1 text-muted-foreground">{loadError}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Check that <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> are set, and that the schema
            in <code>supabase/schema.sql</code> has been run.
          </p>
        </div>
      </main>
    );
  }

  return <Dashboard initialClients={initialClients} />;
}
