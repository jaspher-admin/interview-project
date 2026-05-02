"use client";

import { useCallback, useEffect, useState } from "react";
import { ClientsTable } from "@/components/ClientsTable";
import { AddClientModal } from "@/components/AddClientModal";
import { ChatPanel } from "@/components/ChatPanel";
import type { Client } from "@/types/database";

interface DashboardProps {
  initialClients: Client[];
}

export function Dashboard({ initialClients }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/clients", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as { clients?: Client[] };
      if (body.clients) setClients(body.clients);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            EXYT Client Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            {clients.length === 0
              ? "Build your client base and ask questions about it."
              : `${clients.length} client${clients.length === 1 ? "" : "s"} in the knowledge base.`}
          </p>
        </div>
        <AddClientModal onCreated={refresh} />
      </header>

      <div className="grid flex-1 gap-4 sm:gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <div className={refreshing ? "opacity-70 transition-opacity" : ""}>
            <ClientsTable clients={clients} />
          </div>
        </div>
        <aside className="min-w-0 lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
          <ChatPanel />
        </aside>
      </div>
    </div>
  );
}
