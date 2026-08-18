-- Adds the "¿Qué te interesa?" segmentation field to the leads table.
-- See specs/asesoria-capacitacion-ia/spec.md §6.
alter table public.leads
  add column if not exists interes text;

alter table public.leads
  add constraint leads_interes_check
  check (interes is null or interes in ('automation', 'diagnostic', 'training', 'unsure'));

-- PostgREST caches the schema; force it to pick up the new column immediately
-- instead of waiting for the next automatic reload.
select pg_notify('pgrst', 'reload schema');
