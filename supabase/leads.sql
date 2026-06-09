create extension if not exists pgcrypto;

create or replace function public.is_disposable_email_domain(input_email text)
returns boolean
language sql
immutable
parallel safe
as $$
  with email_domain as (
    select lower(split_part(btrim(input_email), '@', 2)) as domain
  ),
  blocked_domains(domain) as (
    values
      ('10minutemail.com'),
      ('20minutemail.com'),
      ('33mail.com'),
      ('dispostable.com'),
      ('dropmail.me'),
      ('emailondeck.com'),
      ('fakeinbox.com'),
      ('getnada.com'),
      ('grr.la'),
      ('guerrillamail.biz'),
      ('guerrillamail.com'),
      ('guerrillamail.de'),
      ('guerrillamail.net'),
      ('guerrillamail.org'),
      ('inboxkitten.com'),
      ('mail.gw'),
      ('mail.tm'),
      ('maildrop.cc'),
      ('mailinator.com'),
      ('mailnesia.com'),
      ('mintemail.com'),
      ('moakt.com'),
      ('mytemp.email'),
      ('sharklasers.com'),
      ('temp-mail.io'),
      ('temp-mail.org'),
      ('tempmail.com'),
      ('tempmail.net'),
      ('tempr.email'),
      ('throwawaymail.com'),
      ('tmail.io'),
      ('trashmail.com'),
      ('yopmail.com'),
      ('yopmail.fr'),
      ('yopmail.net')
  )
  select exists (
    select 1
    from email_domain, blocked_domains
    where email_domain.domain = blocked_domains.domain
      or email_domain.domain like '%.' || blocked_domains.domain
  );
$$;

create or replace function public.is_allowed_lead_email(input_email text)
returns boolean
language sql
immutable
parallel safe
as $$
  select
    input_email = lower(btrim(input_email))
    and input_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    and not public.is_disposable_email_domain(input_email);
$$;

grant execute on function public.is_disposable_email_domain(text) to anon, authenticated;
grant execute on function public.is_allowed_lead_email(text) to anon, authenticated;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null check (char_length(btrim(nombre)) between 2 and 120),
  whatsapp text not null check (char_length(btrim(whatsapp)) between 7 and 30),
  email text not null check (public.is_allowed_lead_email(email)),
  tipo text not null check (tipo in ('individual', 'abono')),
  zona text not null check (zona in ('General', 'VIP')),
  acepta_tratamiento boolean not null default true check (acepta_tratamiento is true),
  politica_aceptada_en timestamptz not null default now(),
  origen text not null default 'landing_bucaramundial',
  page_url text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_tipo_zona_idx on public.leads (tipo, zona);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_email_allowed_chk'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_email_allowed_chk check (public.is_allowed_lead_email(email)) not valid;
  end if;
end $$;

alter table public.leads enable row level security;

revoke all on table public.leads from anon, authenticated;

grant insert (
  nombre,
  whatsapp,
  email,
  tipo,
  zona,
  acepta_tratamiento,
  politica_aceptada_en,
  origen,
  page_url,
  user_agent,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term
) on public.leads to anon;

drop policy if exists "Permitir registro publico de leads" on public.leads;

create policy "Permitir registro publico de leads"
on public.leads
for insert
to anon
with check (
  acepta_tratamiento is true
  and tipo in ('individual', 'abono')
  and zona in ('General', 'VIP')
  and char_length(btrim(nombre)) between 2 and 120
  and char_length(btrim(whatsapp)) between 7 and 30
  and public.is_allowed_lead_email(email)
);
