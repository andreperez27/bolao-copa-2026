-- Corrige palpites invertidos em cartelas importadas via HTML antigo
-- (ordem dos times trocada entre HTML e JOGOS_GRUPOS atuais)
-- Rode no SQL Editor do Supabase Dashboard após o deploy

-- Helper para trocar gols_a <-> gols_b de um jogo dentro do JSONB palpites
CREATE OR REPLACE FUNCTION swap_palpites(palpites JSONB, jogo_id TEXT)
RETURNS JSONB AS $$
DECLARE
  ga INT; gb INT;
BEGIN
  ga := (palpites #>> ARRAY[jogo_id, 'gols_a'])::INT;
  gb := (palpites #>> ARRAY[jogo_id, 'gols_b'])::INT;
  IF ga IS NULL OR gb IS NULL THEN RETURN palpites; END IF;
  RETURN jsonb_set(
    jsonb_set(palpites, ARRAY[jogo_id, 'gols_a'], to_jsonb(gb)),
    ARRAY[jogo_id, 'gols_b'], to_jsonb(ga)
  );
END;
$$ LANGUAGE plpgsql;

-- Atualiza cartelas importadas (nome = 'Importada') corrigindo os jogos afetados
UPDATE cartelas SET palpites = swap_palpites(
  swap_palpites(
    swap_palpites(
      swap_palpites(
        swap_palpites(
          swap_palpites(
            swap_palpites(
              swap_palpites(
                swap_palpites(
                  swap_palpites(
                    swap_palpites(
                      swap_palpites(
                        swap_palpites(
                          swap_palpites(
                            swap_palpites(
                              swap_palpites(
                                swap_palpites(
                                  swap_palpites(
                                    swap_palpites(
                                      swap_palpites(
                                        swap_palpites(
                                          swap_palpites(
                                            swap_palpites(
                                              swap_palpites(palpites, 'wc2026-10'),
                                              'wc2026-9'),
                                            'wc2026-16'),
                                          'wc2026-17'),
                                        'wc2026-14'),
                                      'wc2026-21'),
                                    'wc2026-19'),
                                  'wc2026-18'),
                                'wc2026-29'),
                              'wc2026-24'),
                            'wc2026-33'),
                          'wc2026-30'),
                        'wc2026-34'),
                      'wc2026-41'),
                    'wc2026-40'),
                  'wc2026-39'),
                'wc2026-47'),
              'wc2026-42'),
            'wc2026-48'),
          'wc2026-57'),
        'wc2026-56'),
      'wc2026-64'),
    'wc2026-61'),
  'wc2026-60'),
  'wc2026-62')
WHERE nome = 'Importada' AND palpites IS NOT NULL AND palpites != '{}'::JSONB;

-- Aplica nos grupos L também (mais 3 jogos)
UPDATE cartelas SET palpites = swap_palpites(
  swap_palpites(
    swap_palpites(palpites, 'wc2026-70'),
    'wc2026-68'),
  'wc2026-66')
WHERE nome = 'Importada' AND palpites IS NOT NULL AND palpites != '{}'::JSONB;

DROP FUNCTION IF EXISTS swap_palpites;
