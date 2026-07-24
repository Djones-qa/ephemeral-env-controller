CREATE TABLE IF NOT EXISTS environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'pending',
  branch VARCHAR(255) NOT NULL,
  pr_number INT,
  commit_sha VARCHAR(64),
  port INT,
  cpu_millis INT NOT NULL DEFAULT 250,
  memory_mb INT NOT NULL DEFAULT 256,
  storage_mb INT NOT NULL DEFAULT 512,
  url TEXT,
  extensions INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_envs_state ON environments (state);
CREATE INDEX IF NOT EXISTS idx_envs_branch ON environments (branch);
CREATE INDEX IF NOT EXISTS idx_envs_expires ON environments (expires_at);
