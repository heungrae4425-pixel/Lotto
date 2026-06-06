create extension if not exists pgcrypto;

create table if not exists public.lotto_draws (
  id uuid primary key default gen_random_uuid(),
  draw_no integer not null unique,
  draw_date date not null,
  no1 integer not null check (no1 between 1 and 45),
  no2 integer not null check (no2 between 1 and 45),
  no3 integer not null check (no3 between 1 and 45),
  no4 integer not null check (no4 between 1 and 45),
  no5 integer not null check (no5 between 1 and 45),
  no6 integer not null check (no6 between 1 and 45),
  bonus_no integer not null check (bonus_no between 1 and 45),
  first_winner_count integer,
  first_win_amount bigint,
  first_total_amount bigint,
  total_sell_amount bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_numbers (
  id uuid primary key default gen_random_uuid(),
  numbers jsonb not null,
  method text not null,
  created_at timestamptz not null default now()
);

create index if not exists lotto_draws_draw_date_idx on public.lotto_draws (draw_date desc);
create index if not exists lotto_draws_draw_no_desc_idx on public.lotto_draws (draw_no desc);
create index if not exists generated_numbers_created_at_idx on public.generated_numbers (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lotto_draws_updated_at on public.lotto_draws;
create trigger set_lotto_draws_updated_at
before update on public.lotto_draws
for each row execute function public.set_updated_at();

alter table public.lotto_draws enable row level security;
alter table public.generated_numbers enable row level security;

drop policy if exists "lotto_draws are readable" on public.lotto_draws;
create policy "lotto_draws are readable"
on public.lotto_draws for select
to anon, authenticated
using (true);

drop policy if exists "generated_numbers can be inserted by service only" on public.generated_numbers;
create policy "generated_numbers can be inserted by service only"
on public.generated_numbers for insert
to service_role
with check (true);
