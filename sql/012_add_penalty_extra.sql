-- =============================================================
-- BOLÃO COPA 2026 — Adicionar dados de prorrogação/pênaltis
-- Execute no SQL Editor do Supabase
-- =============================================================

-- 1. Ver os resultados atuais (para saber quais jogos atualizar)
SELECT id, resultados FROM admin WHERE id = 1;

-- 2. Atualizar um jogo com prorrogação (ex: placar 1×1, pro 2×1)
-- Substitua 'J74', os valores e repita para cada jogo necessário
UPDATE admin
SET resultados = jsonb_set(
  resultados,
  '{J74}',
  '{"placar_a": 1, "placar_b": 1, "pro_a": 2, "pro_b": 1}'::jsonb
)
WHERE id = 1;

-- 3. Atualizar um jogo com pênaltis (ex: placar 1×1, pen 3×4)
UPDATE admin
SET resultados = jsonb_set(
  resultados,
  '{J74}',
  '{"placar_a": 1, "placar_b": 1, "pen_a": 3, "pen_b": 4}'::jsonb
)
WHERE id = 1;

-- 4. Atualizar um jogo com prorrogação E pênaltis (ex: 1×1, pro 0×0, pen 3×4)
UPDATE admin
SET resultados = jsonb_set(
  resultados,
  '{J74}',
  '{"placar_a": 1, "placar_b": 1, "pro_a": 0, "pro_b": 0, "pen_a": 3, "pen_b": 4}'::jsonb
)
WHERE id = 1;

-- 5. Para múltiplos jogos de uma vez, use esta sintaxe:
WITH dados AS (
  SELECT
    '{
      "J74": {"placar_a": 1, "placar_b": 1, "pen_a": 3, "pen_b": 4},
      "J75": {"placar_a": 2, "placar_b": 1}
    }'::jsonb AS updates
)
UPDATE admin
SET resultados = admin.resultados || dados.updates
FROM dados
WHERE id = 1;

-- 6. Ver resultado final
SELECT id, jsonb_pretty(resultados) FROM admin WHERE id = 1;
