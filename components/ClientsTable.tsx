"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { US_STATE_NAME_BY_CODE } from "@/lib/states";
import type { Client, Industry } from "@/types/database";

const INDUSTRY_BADGE: Record<Industry, string> = {
  Technology: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Healthcare: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  Finance: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  Retail: "bg-purple-100 text-purple-800 hover:bg-purple-100",
};

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (clients.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30">
        <p className="text-sm text-muted-foreground">
          No clients yet — click <span className="font-medium">+ Add Client</span> to get started.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className="px-3 py-3 font-medium">Company</th>
                <th className="px-3 py-3 font-medium">Industry</th>
                <th className="px-3 py-3 text-right font-medium">Employees</th>
                <th className="px-3 py-3 text-right font-medium">Annual Revenue</th>
                <th className="px-3 py-3 font-medium">States</th>
                <th className="px-3 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((c) => {
                const isOpen = !!expanded[c.id];
                const stateNames = c.states
                  .map((code) => US_STATE_NAME_BY_CODE[code] ?? code)
                  .join(", ");
                return (
                  <ClientRow
                    key={c.id}
                    client={c}
                    isOpen={isOpen}
                    stateNames={stateNames}
                    onToggle={() =>
                      setExpanded((p) => ({ ...p, [c.id]: !p[c.id] }))
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface ClientRowProps {
  client: Client;
  isOpen: boolean;
  stateNames: string;
  onToggle: () => void;
}

function ClientRow({ client, isOpen, stateNames, onToggle }: ClientRowProps) {
  const Chevron = isOpen ? ChevronDown : ChevronRight;
  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-muted/40"
        onClick={onToggle}
      >
        <td className="px-3 py-3 align-middle">
          <Chevron className="h-4 w-4 text-muted-foreground" />
        </td>
        <td className="px-3 py-3 font-medium">{client.company_name}</td>
        <td className="px-3 py-3">
          <Badge
            variant="secondary"
            className={cn("font-medium", INDUSTRY_BADGE[client.industry])}
          >
            {client.industry}
          </Badge>
        </td>
        <td className="px-3 py-3 text-right tabular-nums">
          {formatNumber(client.employee_count)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums">
          {formatCurrency(client.annual_revenue)}
        </td>
        <td className="px-3 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted underline-offset-4">
                {client.states.length}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="whitespace-pre-wrap leading-snug">
                {stateNames || "None"}
              </p>
            </TooltipContent>
          </Tooltip>
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
          {formatDate(client.created_at)}
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-muted/20">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailBlock title="Description" value={client.description} />
              <DetailBlock title="Notes" value={client.notes} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {value && value.trim().length > 0 ? (
          value
        ) : (
          <span className="italic text-muted-foreground">None</span>
        )}
      </p>
    </div>
  );
}
