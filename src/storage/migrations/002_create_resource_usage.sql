CREATE TABLE IF NOT EXISTS resource_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  cpu_percent DECIMAL(5,2),
  memory_used_mb INT,
  storage_used_mb INT,
  cost_estimate DECIMAL(8,4),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resource_env_id ON resource_usage (environment_id);
CREATE INDEX IF NOT EXISTS idx_resource_recorded ON resource_usage (recorded_at DESC);
