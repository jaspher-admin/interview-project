create extension if not exists pgcrypto;

create table public.clients (
  id              uuid primary key default gen_random_uuid(),
  company_name    text not null,
  employee_count  integer not null check (employee_count >= 0),
  annual_revenue  numeric not null check (annual_revenue >= 0),
  industry        text not null check (industry in ('Technology','Healthcare','Finance','Retail')),
  states          text[] not null default '{}',
  description     text,
  notes           text,
  created_at      timestamptz not null default now()
);

create index clients_industry_idx   on public.clients(industry);
create index clients_created_at_idx on public.clients(created_at desc);

alter table public.clients enable row level security;

-- Open access for v1 (no auth yet). Tighten before production.
create policy "anon read clients"   on public.clients for select using (true);
create policy "anon insert clients" on public.clients for insert with check (true);
