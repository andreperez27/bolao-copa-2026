-- =============================================================
-- BOLÃO COPA 2026 — Adiciona colunas bolao_encerrado e campeao_real
-- Execute no SQL Editor do Supabase
-- =============================================================

ALTER TABLE config
  ADD COLUMN IF NOT EXISTS bolao_encerrado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS campeao_real TEXT DEFAULT '';
