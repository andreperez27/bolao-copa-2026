-- =============================================================
-- BOLÃO COPA 2026 — Adicionar dados de pênaltis
-- Execute no SQL Editor do Supabase
-- =============================================================

-- 1. Ver os resultados atuais
SELECT id, resultados FROM admin WHERE id = 1;

-- 2. Atualizar um jogo com pênaltis (ex: placar 1×1, pen 3×4)
-- Substitua '74' pelo ID do jogo e os valores corretos
UPDATE admin
SET resultados = jsonb_set(
  resultados,
  '{74}',
  '{"placar_a": 1, "placar_b": 1, "pen_a": 3, "pen_b": 4}'::jsonb
)
WHERE id = 1;

-- 3. Para múltiplos jogos de uma vez:
WITH dados AS (
  SELECT
    '{
      "74": {"placar_a": 1, "placar_b": 1, "pen_a": 3, "pen_b": 4},
      "75": {"placar_a": 2, "placar_b": 0}
    }'::jsonb AS updates
)
UPDATE admin
SET resultados = admin.resultados || dados.updates
FROM dados
WHERE id = 1;

-- 4. Ver resultado final
SELECT id, jsonb_pretty(resultados) FROM admin WHERE id = 1;
