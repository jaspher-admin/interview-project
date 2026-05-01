"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatesMultiSelect } from "@/components/StatesMultiSelect";
import { clientFormSchema, INDUSTRIES, type IndustryEnum } from "@/lib/validators";

interface AddClientModalProps {
  onCreated: () => void;
}

interface FormState {
  company_name: string;
  employee_count: string;
  annual_revenue: string;
  industry: IndustryEnum | "";
  states: string[];
  description: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  company_name: "",
  employee_count: "",
  annual_revenue: "",
  industry: "",
  states: [],
  description: "",
  notes: "",
};

export function AddClientModal({ onCreated }: AddClientModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!submitting) {
      setOpen(next);
      if (!next) reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      company_name: form.company_name,
      employee_count: Number(form.employee_count),
      annual_revenue: Number(form.annual_revenue),
      industry: form.industry,
      states: form.states,
      description: form.description,
      notes: form.notes,
    };

    const parsed = clientFormSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(fieldErrors)) {
        if (v && v[0]) next[k] = v[0];
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      toast.success("Client added");
      setOpen(false);
      reset();
      onCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
          <DialogDescription>
            Add a new company to the EXYT client knowledge base.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Company name" htmlFor="company_name" error={errors.company_name}>
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="Acme Inc."
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Employee count"
              htmlFor="employee_count"
              error={errors.employee_count}
            >
              <Input
                id="employee_count"
                type="number"
                min={0}
                step={1}
                value={form.employee_count}
                onChange={(e) => set("employee_count", e.target.value)}
                placeholder="0"
              />
            </Field>

            <Field
              label="Annual revenue"
              htmlFor="annual_revenue"
              error={errors.annual_revenue}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="annual_revenue"
                  type="number"
                  min={0}
                  step="0.01"
                  className="pl-6"
                  value={form.annual_revenue}
                  onChange={(e) => set("annual_revenue", e.target.value)}
                  placeholder="0"
                />
              </div>
            </Field>
          </div>

          <Field label="Industry" htmlFor="industry" error={errors.industry}>
            <Select
              value={form.industry || undefined}
              onValueChange={(v) => set("industry", v as IndustryEnum)}
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="States" htmlFor="states" error={errors.states}>
            <StatesMultiSelect
              id="states"
              value={form.states}
              onChange={(next) => set("states", next)}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            error={errors.description}
            optional
          >
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="What does this company do?"
            />
          </Field>

          <Field label="Notes" htmlFor="notes" error={errors.notes} optional>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Anything internal worth remembering."
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
