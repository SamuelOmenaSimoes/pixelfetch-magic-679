CREATE TABLE IF NOT EXISTS contacts (
 id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE, payload_hash TEXT NOT NULL,
 name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('experimental','matricula')), unit_slug TEXT NOT NULL,
 unit_name TEXT NOT NULL, plan_id TEXT NOT NULL, plan_name TEXT, offer_price TEXT,
 discipline TEXT NOT NULL, goal TEXT NOT NULL, notes TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo','em-atendimento','concluido','cancelado')),
 created_at TEXT NOT NULL, privacy_version TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS contacts_date ON contacts(created_at DESC);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at BIGINT NOT NULL, auth_version TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS limits_expiry ON limits(expires_at);
