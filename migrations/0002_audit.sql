create table if not exists audit_sessions (
  id text primary key,
  actor text not null,
  purpose text not null,
  status text not null default 'open',
  snapshot jsonb not null,
  opened_at timestamptz not null default now(),
  reverted_at timestamptz
);

create index if not exists audit_sessions_opened_idx on audit_sessions (opened_at desc);
