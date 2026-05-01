"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { US_STATES, US_STATE_CODES } from "@/lib/states";
import { cn } from "@/lib/utils";

interface StatesMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  id?: string;
}

export function StatesMultiSelect({
  value,
  onChange,
  id,
}: StatesMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(value);

  const toggle = (code: string) => {
    if (selectedSet.has(code)) {
      onChange(value.filter((c) => c !== code));
    } else {
      onChange([...value, code]);
    }
  };

  const remove = (code: string) => {
    onChange(value.filter((c) => c !== code));
  };

  const selectAll = () => onChange([...US_STATE_CODES]);
  const clearAll = () => onChange([]);

  const triggerLabel =
    value.length > 0 ? `Select states (${value.length})` : "Select states";

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className={cn(value.length === 0 && "text-muted-foreground")}>
              {triggerLabel}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search states..." />
            <CommandList>
              <CommandEmpty>No states found.</CommandEmpty>
              <CommandGroup>
                {US_STATES.map((state) => {
                  const checked = selectedSet.has(state.code);
                  return (
                    <CommandItem
                      key={state.code}
                      value={`${state.name} ${state.code}`}
                      onSelect={() => toggle(state.code)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          checked
                            ? "bg-primary text-primary-foreground"
                            : "opacity-60 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="flex-1">{state.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {state.code}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <div className="flex items-center justify-between p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAll}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
              >
                Clear
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code) => (
            <Badge
              key={code}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {code}
              <button
                type="button"
                onClick={() => remove(code)}
                className="rounded-sm p-0.5 transition-colors hover:bg-background/60"
                aria-label={`Remove ${code}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
