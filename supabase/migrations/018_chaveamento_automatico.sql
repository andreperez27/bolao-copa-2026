-- ═══════════════════════════════════════════════════════════════
-- Migration 018: Chaveamento Automático — Copa 2026
-- ═══════════════════════════════════════════════════════════════
-- ATENÇÃO: Este SQL NÃO foi aplicado ao Supabase sjleucelnptbgyjofhnz
-- por falta de service_role key. As funcionalidades foram implementadas
-- 100% client-side via localStorage + derived state do resultados.
-- Mantido como referência para deploy futuro.
-- ═══════════════════════════════════════════════════════════════

-- ─── Group standings (materializada ou view) ────────────────
CREATE TABLE IF NOT EXISTS group_standings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    TEXT NOT NULL,          -- 'A' a 'L'
    team_id     UUID,
    team_name   TEXT NOT NULL,
    flag_url    TEXT,
    J           INT NOT NULL DEFAULT 0,
    V           INT NOT NULL DEFAULT 0,
    E           INT NOT NULL DEFAULT 0,
    D           INT NOT NULL DEFAULT 0,
    GP          INT NOT NULL DEFAULT 0,
    GC          INT NOT NULL DEFAULT 0,
    SG          INT NOT NULL DEFAULT 0,
    PTS         INT NOT NULL DEFAULT 0,
    position    INT,                    -- 1, 2, 3, 4
    confirmed   BOOLEAN NOT NULL DEFAULT false,
    status      TEXT NOT NULL DEFAULT 'pending', -- classified | possible | eliminated | pending
    UNIQUE(group_id, team_name)
);

-- ─── Third place ranking (gerado após fim dos grupos) ──────
CREATE TABLE IF NOT EXISTS third_place_ranking (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    TEXT NOT NULL,
    team_id     UUID,
    team_name   TEXT NOT NULL,
    PTS         INT NOT NULL DEFAULT 0,
    SG          INT NOT NULL DEFAULT 0,
    GP          INT NOT NULL DEFAULT 0,
    discipline  INT NOT NULL DEFAULT 0,
    rank        INT,                    -- 1 a 12
    advances    BOOLEAN NOT NULL DEFAULT false,
    finalized   BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(group_id)
);

-- ─── Knockout matches (1/16 avos até final) ────────────────
CREATE TABLE IF NOT EXISTS knockout_matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round           TEXT NOT NULL,       -- 'r32', 'r16', 'qf', 'sf', 'f'
    match_number    INT NOT NULL,
    slot1_group     TEXT,
    slot1_position  INT,                 -- 1, 2 ou 3
    slot2_group     TEXT,
    slot2_position  INT,
    team1_id        UUID,
    team2_id        UUID,
    team1_confirmed BOOLEAN NOT NULL DEFAULT false,
    team2_confirmed BOOLEAN NOT NULL DEFAULT false,
    unlocked        BOOLEAN NOT NULL DEFAULT false,
    involves_third  BOOLEAN NOT NULL DEFAULT false,
    result_team1    INT,
    result_team2    INT
);

-- ─── Índices ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_standings_group ON group_standings(group_id);
CREATE INDEX IF NOT EXISTS idx_third_place_ranking_rank ON third_place_ranking(rank);
CREATE INDEX IF NOT EXISTS idx_knockout_matches_round ON knockout_matches(round);
