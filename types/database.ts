export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Industry = "Technology" | "Healthcare" | "Finance" | "Retail";

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          company_name: string;
          employee_count: number;
          annual_revenue: number;
          industry: Industry;
          states: string[];
          description: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          employee_count: number;
          annual_revenue: number;
          industry: Industry;
          states?: string[];
          description?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          employee_count?: number;
          annual_revenue?: number;
          industry?: Industry;
          states?: string[];
          description?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
