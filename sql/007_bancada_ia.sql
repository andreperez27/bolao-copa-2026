-- ============================================================
-- BOLÃO COPA 2026 — Bancada de IAs
-- Adaptado: jogadores tem apenas nome, senha, created_at
-- ============================================================

-- 1. Flag para identificar robôs
ALTER TABLE jogadores ADD COLUMN IF NOT EXISTS is_ia BOOLEAN DEFAULT FALSE;

-- 2. Inserir perfis das IAs (nome é a única PK)
INSERT INTO jogadores (nome, is_ia) VALUES
  ('🤖 Gemini (Google)',   TRUE),
  ('🤖 ChatGPT (OpenAI)',   TRUE),
  ('🤖 Claude (Anthropic)', TRUE)
ON CONFLICT (nome) DO NOTHING;
