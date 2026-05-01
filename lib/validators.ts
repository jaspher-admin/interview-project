import { z } from "zod";
import { US_STATE_CODES } from "@/lib/states";

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
] as const;

export type IndustryEnum = (typeof INDUSTRIES)[number];

const stateCodeSchema = z
  .string()
  .refine((code) => US_STATE_CODES.includes(code), {
    message: "Invalid state code",
  });

export const clientFormSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(200, "Company name is too long"),
  employee_count: z
    .number({ invalid_type_error: "Employee count must be a number" })
    .int("Employee count must be a whole number")
    .min(0, "Employee count cannot be negative"),
  annual_revenue: z
    .number({ invalid_type_error: "Annual revenue must be a number" })
    .min(0, "Annual revenue cannot be negative"),
  industry: z.enum(INDUSTRIES, {
    errorMap: () => ({ message: "Select an industry" }),
  }),
  states: z
    .array(stateCodeSchema)
    .min(1, "Select at least one state"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .min(1),
});
