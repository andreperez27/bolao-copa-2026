/**
 * scripts/alimentarPalpitesIA.js
 *
 * Insere em lote os palpites das IAs na tabela cartelas.
 * Uso: node scripts/alimentarPalpitesIA.js
 *
 * Pré-requisitos:
 *   1. Rodar sql/007_bancada_ia.sql no Supabase
 *   2. Configurar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://sjleucelnptbgyjofhnz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERRO: Defina SUPABASE_SERVICE_ROLE_KEY no ambiente ou edite o script.");
  process.exit(1);
}

const HEADERS = {
  "apikey": SUPABASE_SERVICE_ROLE_KEY,
  "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates",
};

const GRUPO_ID = "00000000-0000-0000-0000-000000000000";

// ─── Palpites base (comuns) ─────────────────────────────────
// Jogos já realizados (resultados reais da Copa 2026)
const BASE = {
  // Grupo A — resultados reais
  "wc2026-0": { placar_a: 2, placar_b: 0 }, // México 2-0 África do Sul
  "wc2026-1": { placar_a: 2, placar_b: 1 }, // Coreia do Sul 2-1 Tcheca
  // Grupo B — resultados reais
  "wc2026-6": { placar_a: 1, placar_b: 1 }, // Canadá 1-1 Bósnia
  "wc2026-7": { placar_a: 0, placar_b: 1 }, // Catar 0-1 Suíça
  // Grupo D — resultado real
  "wc2026-18": { placar_a: 4, placar_b: 1 }, // EUA 4-1 Paraguai
};

// ─── Palpites Gemini (Google) ───────────────────────────────
// Conservador, favorece favoritos históricos, poucos gols
const GEMINI = {
  ...BASE,
  // Grupo A (restante)
  "wc2026-2":  { placar_a: 2, placar_b: 0 }, // Tcheca 2-0 África do Sul
  "wc2026-3":  { placar_a: 2, placar_b: 1 }, // México 2-1 Coreia do Sul
  "wc2026-4":  { placar_a: 0, placar_b: 2 }, // Tcheca 0-2 México
  "wc2026-5":  { placar_a: 0, placar_b: 3 }, // África do Sul 0-3 Coreia do Sul
  // Grupo B (restante)
  "wc2026-8":  { placar_a: 2, placar_b: 0 }, // Suíça 2-0 Bósnia
  "wc2026-9":  { placar_a: 1, placar_b: 0 }, // Canadá 1-0 Catar
  "wc2026-10": { placar_a: 2, placar_b: 1 }, // Suíça 2-1 Canadá
  "wc2026-11": { placar_a: 1, placar_b: 0 }, // Bósnia 1-0 Catar
  // Grupo C
  "wc2026-12": { placar_a: 3, placar_b: 0 }, // Brasil 3-0 Marrocos
  "wc2026-13": { placar_a: 0, placar_b: 2 }, // Haiti 0-2 Escócia
  "wc2026-14": { placar_a: 1, placar_b: 2 }, // Escócia 1-2 Marrocos
  "wc2026-15": { placar_a: 5, placar_b: 0 }, // Brasil 5-0 Haiti
  "wc2026-16": { placar_a: 0, placar_b: 3 }, // Escócia 0-3 Brasil
  "wc2026-17": { placar_a: 3, placar_b: 0 }, // Marrocos 3-0 Haiti
  // Grupo D (restante)
  "wc2026-19": { placar_a: 1, placar_b: 2 }, // Austrália 1-2 Turquia
  "wc2026-20": { placar_a: 3, placar_b: 0 }, // EUA 3-0 Austrália
  "wc2026-21": { placar_a: 2, placar_b: 1 }, // Turquia 2-1 Paraguai
  "wc2026-22": { placar_a: 1, placar_b: 2 }, // Turquia 1-2 EUA
  "wc2026-23": { placar_a: 1, placar_b: 1 }, // Paraguai 1-1 Austrália
  // Grupo E
  "wc2026-24": { placar_a: 4, placar_b: 0 }, // Alemanha 4-0 Curaçao
  "wc2026-25": { placar_a: 1, placar_b: 1 }, // Costa do Marfim 1-1 Equador
  "wc2026-26": { placar_a: 3, placar_b: 1 }, // Alemanha 3-1 Costa do Marfim
  "wc2026-27": { placar_a: 2, placar_b: 0 }, // Equador 2-0 Curaçao
  "wc2026-28": { placar_a: 0, placar_b: 2 }, // Curaçao 0-2 Costa do Marfim
  "wc2026-29": { placar_a: 0, placar_b: 2 }, // Equador 0-2 Alemanha
  // Grupo F
  "wc2026-30": { placar_a: 2, placar_b: 0 }, // Holanda 2-0 Japão
  "wc2026-31": { placar_a: 1, placar_b: 0 }, // Suécia 1-0 Tunísia
  "wc2026-32": { placar_a: 2, placar_b: 1 }, // Holanda 2-1 Suécia
  "wc2026-33": { placar_a: 1, placar_b: 1 }, // Tunísia 1-1 Japão
  "wc2026-34": { placar_a: 0, placar_b: 2 }, // Japão 0-2 Suécia
  "wc2026-35": { placar_a: 0, placar_b: 3 }, // Tunísia 0-3 Holanda
  // Grupo G
  "wc2026-36": { placar_a: 2, placar_b: 0 }, // Bélgica 2-0 Egito
  "wc2026-37": { placar_a: 1, placar_b: 0 }, // Irã 1-0 Nova Zelândia
  "wc2026-38": { placar_a: 2, placar_b: 0 }, // Bélgica 2-0 Irã
  "wc2026-39": { placar_a: 0, placar_b: 2 }, // N Zelândia 0-2 Egito
  "wc2026-40": { placar_a: 1, placar_b: 0 }, // Egito 1-0 Irã
  "wc2026-41": { placar_a: 0, placar_b: 3 }, // N Zelândia 0-3 Bélgica
  // Grupo H
  "wc2026-42": { placar_a: 3, placar_b: 0 }, // Espanha 3-0 Cabo Verde
  "wc2026-43": { placar_a: 0, placar_b: 2 }, // Arábia Saudita 0-2 Uruguai
  "wc2026-44": { placar_a: 3, placar_b: 0 }, // Espanha 3-0 Arábia Saudita
  "wc2026-45": { placar_a: 2, placar_b: 0 }, // Uruguai 2-0 Cabo Verde
  "wc2026-46": { placar_a: 1, placar_b: 1 }, // Cabo Verde 1-1 Arábia Saudita
  "wc2026-47": { placar_a: 1, placar_b: 2 }, // Uruguai 1-2 Espanha
  // Grupo I
  "wc2026-48": { placar_a: 2, placar_b: 0 }, // França 2-0 Senegal
  "wc2026-49": { placar_a: 0, placar_b: 2 }, // Iraque 0-2 Noruega
  "wc2026-50": { placar_a: 3, placar_b: 0 }, // França 3-0 Iraque
  "wc2026-51": { placar_a: 1, placar_b: 1 }, // Noruega 1-1 Senegal
  "wc2026-52": { placar_a: 0, placar_b: 2 }, // Noruega 0-2 França
  "wc2026-53": { placar_a: 2, placar_b: 0 }, // Senegal 2-0 Iraque
  // Grupo J
  "wc2026-54": { placar_a: 3, placar_b: 0 }, // Argentina 3-0 Argélia
  "wc2026-55": { placar_a: 2, placar_b: 0 }, // Áustria 2-0 Jordânia
  "wc2026-56": { placar_a: 2, placar_b: 1 }, // Argentina 2-1 Áustria
  "wc2026-57": { placar_a: 0, placar_b: 2 }, // Jordânia 0-2 Argélia
  "wc2026-58": { placar_a: 1, placar_b: 1 }, // Argélia 1-1 Áustria
  "wc2026-59": { placar_a: 0, placar_b: 4 }, // Jordânia 0-4 Argentina
  // Grupo K
  "wc2026-60": { placar_a: 2, placar_b: 0 }, // Portugal 2-0 RD Congo
  "wc2026-61": { placar_a: 0, placar_b: 2 }, // Uzbequistão 0-2 Colômbia
  "wc2026-62": { placar_a: 3, placar_b: 0 }, // Portugal 3-0 Uzbequistão
  "wc2026-63": { placar_a: 2, placar_b: 0 }, // Colômbia 2-0 RD Congo
  "wc2026-64": { placar_a: 1, placar_b: 2 }, // Colômbia 1-2 Portugal
  "wc2026-65": { placar_a: 1, placar_b: 1 }, // RD Congo 1-1 Uzbequistão
  // Grupo L
  "wc2026-66": { placar_a: 2, placar_b: 1 }, // Inglaterra 2-1 Croácia
  "wc2026-67": { placar_a: 2, placar_b: 0 }, // Gana 2-0 Panamá
  "wc2026-68": { placar_a: 3, placar_b: 0 }, // Inglaterra 3-0 Gana
  "wc2026-69": { placar_a: 0, placar_b: 2 }, // Panamá 0-2 Croácia
  "wc2026-70": { placar_a: 0, placar_b: 4 }, // Panamá 0-4 Inglaterra
  "wc2026-71": { placar_a: 1, placar_b: 1 }, // Croácia 1-1 Gana

  // Oitavas (projeção Gemini)
  "oit-1": { placar_a: 2, placar_b: 0 }, // 1A(México) x 2B(Suíça)
  "oit-2": { placar_a: 1, placar_b: 0 }, // 1C(Brasil) x 2D(EUA)
  "oit-3": { placar_a: 1, placar_b: 1, placar_a_pen: 4, placar_b_pen: 3 }, // 1B(Canadá) x 2A(Coreia)
  "oit-4": { placar_a: 2, placar_b: 1 }, // 1D(Turquia) x 2C(Marrocos)
  "oit-5": { placar_a: 2, placar_b: 0 }, // 1E(Alemanha) x 2F(Holanda)
  "oit-6": { placar_a: 1, placar_b: 0 }, // 1G(Bélgica) x 2H(Uruguai)
  "oit-7": { placar_a: 1, placar_b: 1, placar_a_pen: 3, placar_b_pen: 5 }, // 1F(Suécia) x 2E(Equador)
  "oit-8": { placar_a: 1, placar_b: 2 }, // 1H(Espanha) x 2G(Egito)
  // Quartas
  "qua-1": { placar_a: 2, placar_b: 1 }, // México x Brasil
  "qua-2": { placar_a: 2, placar_b: 0 }, // Canadá x Turquia
  "qua-3": { placar_a: 1, placar_b: 1, placar_a_pen: 4, placar_b_pen: 2 }, // Alemanha x Bélgica
  "qua-4": { placar_a: 2, placar_b: 2, placar_a_pen: 3, placar_b_pen: 4 }, // Equador x Espanha
  // Semi
  "sem-1": { placar_a: 1, placar_b: 2 }, // Brasil x Canadá
  "sem-2": { placar_a: 1, placar_b: 0 }, // Alemanha x Espanha
  // Final
  "fin-1": { placar_a: 2, placar_b: 1 }, // Canadá x Alemanha
};

// ─── Palpites ChatGPT (OpenAI) ──────────────────────────────
// Mais equilibrado, admite zebras moderadas, mais gols
const CHATGPT = {
  ...BASE,
  // Grupo A
  "wc2026-2":  { placar_a: 1, placar_b: 0 },
  "wc2026-3":  { placar_a: 2, placar_b: 2 },
  "wc2026-4":  { placar_a: 1, placar_b: 1 },
  "wc2026-5":  { placar_a: 0, placar_b: 2 },
  // Grupo B
  "wc2026-8":  { placar_a: 1, placar_b: 1 },
  "wc2026-9":  { placar_a: 2, placar_b: 0 },
  "wc2026-10": { placar_a: 1, placar_b: 1 },
  "wc2026-11": { placar_a: 1, placar_b: 1 },
  // Grupo C
  "wc2026-12": { placar_a: 2, placar_b: 1 },
  "wc2026-13": { placar_a: 1, placar_b: 1 },
  "wc2026-14": { placar_a: 0, placar_b: 2 },
  "wc2026-15": { placar_a: 4, placar_b: 0 },
  "wc2026-16": { placar_a: 0, placar_b: 4 },
  "wc2026-17": { placar_a: 2, placar_b: 0 },
  // Grupo D
  "wc2026-19": { placar_a: 1, placar_b: 2 },
  "wc2026-20": { placar_a: 2, placar_b: 1 },
  "wc2026-21": { placar_a: 2, placar_b: 0 },
  "wc2026-22": { placar_a: 2, placar_b: 2 },
  "wc2026-23": { placar_a: 1, placar_b: 2 },
  // Grupo E
  "wc2026-24": { placar_a: 3, placar_b: 0 },
  "wc2026-25": { placar_a: 2, placar_b: 1 },
  "wc2026-26": { placar_a: 2, placar_b: 0 },
  "wc2026-27": { placar_a: 3, placar_b: 0 },
  "wc2026-28": { placar_a: 0, placar_b: 3 },
  "wc2026-29": { placar_a: 0, placar_b: 1 },
  // Grupo F
  "wc2026-30": { placar_a: 2, placar_b: 0 },
  "wc2026-31": { placar_a: 1, placar_b: 0 },
  "wc2026-32": { placar_a: 1, placar_b: 0 },
  "wc2026-33": { placar_a: 0, placar_b: 2 },
  "wc2026-34": { placar_a: 0, placar_b: 1 },
  "wc2026-35": { placar_a: 1, placar_b: 2 },
  // Grupo G
  "wc2026-36": { placar_a: 1, placar_b: 0 },
  "wc2026-37": { placar_a: 2, placar_b: 0 },
  "wc2026-38": { placar_a: 3, placar_b: 1 },
  "wc2026-39": { placar_a: 1, placar_b: 2 },
  "wc2026-40": { placar_a: 1, placar_b: 1 },
  "wc2026-41": { placar_a: 0, placar_b: 2 },
  // Grupo H
  "wc2026-42": { placar_a: 2, placar_b: 1 },
  "wc2026-43": { placar_a: 0, placar_b: 3 },
  "wc2026-44": { placar_a: 3, placar_b: 0 },
  "wc2026-45": { placar_a: 2, placar_b: 0 },
  "wc2026-46": { placar_a: 0, placar_b: 1 },
  "wc2026-47": { placar_a: 2, placar_b: 2 },
  // Grupo I
  "wc2026-48": { placar_a: 2, placar_b: 1 },
  "wc2026-49": { placar_a: 1, placar_b: 2 },
  "wc2026-50": { placar_a: 4, placar_b: 0 },
  "wc2026-51": { placar_a: 2, placar_b: 1 },
  "wc2026-52": { placar_a: 1, placar_b: 1 },
  "wc2026-53": { placar_a: 1, placar_b: 0 },
  // Grupo J
  "wc2026-54": { placar_a: 2, placar_b: 0 },
  "wc2026-55": { placar_a: 1, placar_b: 0 },
  "wc2026-56": { placar_a: 3, placar_b: 0 },
  "wc2026-57": { placar_a: 0, placar_b: 1 },
  "wc2026-58": { placar_a: 2, placar_b: 1 },
  "wc2026-59": { placar_a: 0, placar_b: 3 },
  // Grupo K
  "wc2026-60": { placar_a: 1, placar_b: 0 },
  "wc2026-61": { placar_a: 0, placar_b: 1 },
  "wc2026-62": { placar_a: 2, placar_b: 0 },
  "wc2026-63": { placar_a: 2, placar_b: 0 },
  "wc2026-64": { placar_a: 1, placar_b: 1 },
  "wc2026-65": { placar_a: 0, placar_b: 1 },
  // Grupo L
  "wc2026-66": { placar_a: 2, placar_b: 0 },
  "wc2026-67": { placar_a: 1, placar_b: 1 },
  "wc2026-68": { placar_a: 2, placar_b: 1 },
  "wc2026-69": { placar_a: 1, placar_b: 2 },
  "wc2026-70": { placar_a: 0, placar_b: 3 },
  "wc2026-71": { placar_a: 2, placar_b: 1 },

  // Oitavas
  "oit-1": { placar_a: 1, placar_b: 0 }, // México x Suíça
  "oit-2": { placar_a: 2, placar_b: 1 }, // Brasil x EUA
  "oit-3": { placar_a: 0, placar_b: 0, placar_a_pen: 3, placar_b_pen: 4 }, // Canadá x Coreia
  "oit-4": { placar_a: 2, placar_b: 0 }, // Turquia x Marrocos
  "oit-5": { placar_a: 1, placar_b: 0 }, // Alemanha x Holanda
  "oit-6": { placar_a: 1, placar_b: 1, placar_a_pen: 5, placar_b_pen: 3 }, // Bélgica x Uruguai
  "oit-7": { placar_a: 0, placar_b: 1 }, // Suécia x Equador
  "oit-8": { placar_a: 2, placar_b: 0 }, // Espanha x Egito
  // Quartas
  "qua-1": { placar_a: 1, placar_b: 2 }, // México x Brasil
  "qua-2": { placar_a: 0, placar_b: 1 }, // Canadá x Turquia
  "qua-3": { placar_a: 2, placar_b: 1 }, // Alemanha x Bélgica
  "qua-4": { placar_a: 2, placar_b: 0 }, // Equador x Espanha
  // Semi
  "sem-1": { placar_a: 2, placar_b: 0 }, // Brasil x Turquia
  "sem-2": { placar_a: 1, placar_b: 1, placar_a_pen: 4, placar_b_pen: 2 }, // Alemanha x Espanha
  // Final
  "fin-1": { placar_a: 1, placar_b: 1, placar_a_pen: 3, placar_b_pen: 2 }, // Brasil x Alemanha
};

// ─── Palpites Claude (Anthropic) ────────────────────────────
// Mais ousado, aposta em zebras, times técnicos favorecidos
const CLAUDE = {
  ...BASE,
  // Grupo A
  "wc2026-2":  { placar_a: 1, placar_b: 1 },
  "wc2026-3":  { placar_a: 1, placar_b: 1 },
  "wc2026-4":  { placar_a: 1, placar_b: 2 },
  "wc2026-5":  { placar_a: 1, placar_b: 3 },
  // Grupo B
  "wc2026-8":  { placar_a: 1, placar_b: 0 },
  "wc2026-9":  { placar_a: 2, placar_b: 1 },
  "wc2026-10": { placar_a: 0, placar_b: 1 },
  "wc2026-11": { placar_a: 2, placar_b: 0 },
  // Grupo C
  "wc2026-12": { placar_a: 2, placar_b: 0 },
  "wc2026-13": { placar_a: 0, placar_b: 1 },
  "wc2026-14": { placar_a: 0, placar_b: 1 },
  "wc2026-15": { placar_a: 4, placar_b: 0 },
  "wc2026-16": { placar_a: 0, placar_b: 3 },
  "wc2026-17": { placar_a: 2, placar_b: 0 },
  // Grupo D
  "wc2026-19": { placar_a: 2, placar_b: 1 },
  "wc2026-20": { placar_a: 3, placar_b: 0 },
  "wc2026-21": { placar_a: 1, placar_b: 0 },
  "wc2026-22": { placar_a: 1, placar_b: 2 },
  "wc2026-23": { placar_a: 0, placar_b: 1 },
  // Grupo E
  "wc2026-24": { placar_a: 4, placar_b: 1 },
  "wc2026-25": { placar_a: 0, placar_b: 2 },
  "wc2026-26": { placar_a: 3, placar_b: 0 },
  "wc2026-27": { placar_a: 3, placar_b: 0 },
  "wc2026-28": { placar_a: 1, placar_b: 3 },
  "wc2026-29": { placar_a: 1, placar_b: 1 },
  // Grupo F
  "wc2026-30": { placar_a: 1, placar_b: 1 },
  "wc2026-31": { placar_a: 2, placar_b: 0 },
  "wc2026-32": { placar_a: 1, placar_b: 0 },
  "wc2026-33": { placar_a: 1, placar_b: 1 },
  "wc2026-34": { placar_a: 1, placar_b: 2 },
  "wc2026-35": { placar_a: 0, placar_b: 1 },
  // Grupo G
  "wc2026-36": { placar_a: 2, placar_b: 1 },
  "wc2026-37": { placar_a: 0, placar_b: 0 },
  "wc2026-38": { placar_a: 1, placar_b: 0 },
  "wc2026-39": { placar_a: 1, placar_b: 1 },
  "wc2026-40": { placar_a: 2, placar_b: 1 },
  "wc2026-41": { placar_a: 0, placar_b: 2 },
  // Grupo H
  "wc2026-42": { placar_a: 3, placar_b: 0 },
  "wc2026-43": { placar_a: 0, placar_b: 1 },
  "wc2026-44": { placar_a: 2, placar_b: 0 },
  "wc2026-45": { placar_a: 1, placar_b: 0 },
  "wc2026-46": { placar_a: 0, placar_b: 2 },
  "wc2026-47": { placar_a: 2, placar_b: 1 },
  // Grupo I
  "wc2026-48": { placar_a: 3, placar_b: 1 },
  "wc2026-49": { placar_a: 0, placar_b: 1 },
  "wc2026-50": { placar_a: 3, placar_b: 0 },
  "wc2026-51": { placar_a: 2, placar_b: 0 },
  "wc2026-52": { placar_a: 0, placar_b: 2 },
  "wc2026-53": { placar_a: 2, placar_b: 0 },
  // Grupo J
  "wc2026-54": { placar_a: 4, placar_b: 0 },
  "wc2026-55": { placar_a: 1, placar_b: 0 },
  "wc2026-56": { placar_a: 2, placar_b: 0 },
  "wc2026-57": { placar_a: 1, placar_b: 1 },
  "wc2026-58": { placar_a: 0, placar_b: 1 },
  "wc2026-59": { placar_a: 0, placar_b: 3 },
  // Grupo K
  "wc2026-60": { placar_a: 1, placar_b: 0 },
  "wc2026-61": { placar_a: 1, placar_b: 2 },
  "wc2026-62": { placar_a: 3, placar_b: 0 },
  "wc2026-63": { placar_a: 2, placar_b: 0 },
  "wc2026-64": { placar_a: 1, placar_b: 2 },
  "wc2026-65": { placar_a: 1, placar_b: 2 },
  // Grupo L
  "wc2026-66": { placar_a: 1, placar_b: 1 },
  "wc2026-67": { placar_a: 2, placar_b: 0 },
  "wc2026-68": { placar_a: 2, placar_b: 0 },
  "wc2026-69": { placar_a: 1, placar_b: 1 },
  "wc2026-70": { placar_a: 0, placar_b: 4 },
  "wc2026-71": { placar_a: 1, placar_b: 0 },

  // Oitavas
  "oit-1": { placar_a: 2, placar_b: 1 }, // México x Suíça
  "oit-2": { placar_a: 1, placar_b: 1, placar_a_pen: 5, placar_b_pen: 4 }, // Brasil x EUA
  "oit-3": { placar_a: 2, placar_b: 0 }, // Canadá x Coreia
  "oit-4": { placar_a: 1, placar_b: 2 }, // Turquia x Marrocos
  "oit-5": { placar_a: 0, placar_b: 1 }, // Alemanha x Holanda
  "oit-6": { placar_a: 2, placar_b: 2, placar_a_pen: 4, placar_b_pen: 2 }, // Bélgica x Uruguai
  "oit-7": { placar_a: 1, placar_b: 2 }, // Suécia x Equador
  "oit-8": { placar_a: 2, placar_b: 1 }, // Espanha x Egito
  // Quartas
  "qua-1": { placar_a: 1, placar_b: 1, placar_a_pen: 3, placar_b_pen: 4 }, // México x Brasil
  "qua-2": { placar_a: 3, placar_b: 1 }, // Canadá x Marrocos
  "qua-3": { placar_a: 1, placar_b: 2 }, // Holanda x Bélgica
  "qua-4": { placar_a: 0, placar_b: 1 }, // Equador x Espanha
  // Semi
  "sem-1": { placar_a: 2, placar_b: 1 }, // Brasil x Canadá
  "sem-2": { placar_a: 1, placar_b: 0 }, // Bélgica x Espanha
  // Final
  "fin-1": { placar_a: 1, placar_b: 0 }, // Brasil x Bélgica
};

// ─── Montagem final ─────────────────────────────────────────
const palpitesIAs = {
  "🤖 Gemini (Google)": {
    nome: "Palpites Gemini",
    campeao: "Alemanha",
    palpites: GEMINI,
  },
  "🤖 ChatGPT (OpenAI)": {
    nome: "Palpites ChatGPT",
    campeao: "Brasil",
    palpites: CHATGPT,
  },
  "🤖 Claude (Anthropic)": {
    nome: "Palpites Claude",
    campeao: "França",
    palpites: CLAUDE,
  },
};

async function upsertCartela(participante, dados) {
  const cartela = {
    id: "cart_ia_" + participante.replace(/[^a-zA-Z0-9]/g, "_"),
    participante,
    nome: dados.nome,
    palpites: dados.palpites,
    campeao: dados.campeao || "",
    campeao_fase: "grupos",
    status: "validada",
    valor_pago: 0,
    grupo_id: GRUPO_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(SUPABASE_URL + "/rest/v1/cartelas", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(cartela),
  });

  if (!res.ok && res.status !== 201) {
    const txt = await res.text().catch(() => "");
    console.error(`  ERRO [${participante}]: HTTP ${res.status} — ${txt.slice(0, 200)}`);
    return false;
  }

  console.log(`  OK [${participante}]: ${Object.keys(dados.palpites).length} palpites`);
  return true;
}

async function main() {
  console.log("Alimentando palpites das IAs...\n");

  for (const [participante, dados] of Object.entries(palpitesIAs)) {
    console.log(`Processando ${participante}...`);
    await upsertCartela(participante, dados);
  }

  console.log("\nConcluído!");
}

main().catch(console.error);
