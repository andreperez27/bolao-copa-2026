/**
 * scripts/atualizarPalpites1_16IA.js
 *
 * Atualiza os palpites das IAs para a Segunda Rodada (1/16) com os IDs
 * corretos ("74"-"88"). Ignora o jogo "73" (hoje 28/06).
 *
 * Mapeamento: dez-1→73, dez-2→74, ..., dez-16→88
 *
 * Uso: SUPABASE_SERVICE_ROLE_KEY="chave" node scripts/atualizarPalpites1_16IA.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://sjleucelnptbgyjofhnz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERRO: Defina SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}

const HEADERS = {
  "apikey": SUPABASE_SERVICE_ROLE_KEY,
  "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

// Palpites originais (dez-1 a dez-16) com mapeamento para IDs reais
const DEZ_TO_ID = {
  "dez-1": "73",  "dez-2": "74",  "dez-3": "75",  "dez-4": "76",
  "dez-5": "77",  "dez-6": "78",  "dez-7": "79",  "dez-8": "80",
  "dez-9": "81",  "dez-10": "82", "dez-11": "83", "dez-12": "84",
  "dez-13": "85", "dez-14": "86", "dez-15": "87", "dez-16": "88",
};

const ID_PULAR = "73"; // jogo de hoje (28/06)

const palpites1_16 = {
  Gemini: {
    "dez-1":  { gols_a: 1, gols_b: 0 },
    "dez-2":  { gols_a: 2, gols_b: 0 },
    "dez-3":  { gols_a: 1, gols_b: 1 },
    "dez-4":  { gols_a: 2, gols_b: 1 },
    "dez-5":  { gols_a: 0, gols_b: 1 },
    "dez-6":  { gols_a: 2, gols_b: 0 },
    "dez-7":  { gols_a: 1, gols_b: 1 },
    "dez-8":  { gols_a: 1, gols_b: 0 },
    "dez-9":  { gols_a: 2, gols_b: 0 },
    "dez-10": { gols_a: 1, gols_b: 1 },
    "dez-11": { gols_a: 0, gols_b: 1 },
    "dez-12": { gols_a: 2, gols_b: 1 },
    "dez-13": { gols_a: 1, gols_b: 0 },
    "dez-14": { gols_a: 1, gols_b: 1 },
    "dez-15": { gols_a: 2, gols_b: 0 },
    "dez-16": { gols_a: 0, gols_b: 1 },
  },
  ChatGPT: {
    "dez-1":  { gols_a: 2, gols_b: 0 },
    "dez-2":  { gols_a: 1, gols_b: 1 },
    "dez-3":  { gols_a: 2, gols_b: 1 },
    "dez-4":  { gols_a: 1, gols_b: 0 },
    "dez-5":  { gols_a: 1, gols_b: 2 },
    "dez-6":  { gols_a: 2, gols_b: 0 },
    "dez-7":  { gols_a: 1, gols_b: 0 },
    "dez-8":  { gols_a: 2, gols_b: 2 },
    "dez-9":  { gols_a: 1, gols_b: 1 },
    "dez-10": { gols_a: 1, gols_b: 0 },
    "dez-11": { gols_a: 2, gols_b: 1 },
    "dez-12": { gols_a: 0, gols_b: 1 },
    "dez-13": { gols_a: 2, gols_b: 0 },
    "dez-14": { gols_a: 1, gols_b: 2 },
    "dez-15": { gols_a: 1, gols_b: 1 },
    "dez-16": { gols_a: 2, gols_b: 0 },
  },
  Claude: {
    "dez-1":  { gols_a: 1, gols_b: 1 },
    "dez-2":  { gols_a: 2, gols_b: 1 },
    "dez-3":  { gols_a: 1, gols_b: 0 },
    "dez-4":  { gols_a: 0, gols_b: 2 },
    "dez-5":  { gols_a: 2, gols_b: 0 },
    "dez-6":  { gols_a: 1, gols_b: 2 },
    "dez-7":  { gols_a: 2, gols_b: 0 },
    "dez-8":  { gols_a: 1, gols_b: 0 },
    "dez-9":  { gols_a: 1, gols_b: 2 },
    "dez-10": { gols_a: 2, gols_b: 1 },
    "dez-11": { gols_a: 0, gols_b: 0 },
    "dez-12": { gols_a: 1, gols_b: 1 },
    "dez-13": { gols_a: 2, gols_b: 0 },
    "dez-14": { gols_a: 1, gols_b: 0 },
    "dez-15": { gols_a: 0, gols_b: 2 },
    "dez-16": { gols_a: 1, gols_b: 1 },
  },
};

// Mapeia dez-* → IDs reais, pulando ID_PULAR
function mapearPalpites(estilo) {
  const orig = palpites1_16[estilo];
  const novos = {};
  for (const [dezKey, palp] of Object.entries(orig)) {
    const id = DEZ_TO_ID[dezKey];
    if (id === ID_PULAR) continue;
    novos[id] = palp;
  }
  return novos;
}

const IAS = [
  { participante: "🤖 Gemini (Google)", estilo: "Gemini" },
  { participante: "🤖 ChatGPT (OpenAI)", estilo: "ChatGPT" },
  { participante: "🤖 Claude (Anthropic)", estilo: "Claude" },
];

async function buscarCartela(participante) {
  const nome = encodeURIComponent(participante);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/cartelas?select=id,palpites&participante=eq.${nome}&order=created_at.desc&limit=1`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${participante}`);
  const data = await res.json();
  return data?.[0] || null;
}

async function atualizarCartela(id, palpites) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cartelas?id=eq.${id}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ palpites, updated_at: new Date().toISOString() }),
  });
  if (!res.ok && res.status !== 204) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} — ${txt.slice(0, 200)}`);
  }
  return true;
}

async function main() {
  console.log("Atualizando palpites da 1/16 nas IAs (ignorando jogo 73)...\n");

  for (const ia of IAS) {
    const novos = mapearPalpites(ia.estilo);
    const ids = Object.keys(novos).sort((a,b)=>Number(a)-Number(b));
    console.log(`${ia.participante}: palpites para IDs ${ids.join(", ")}`);

    const cartela = await buscarCartela(ia.participante);
    if (!cartela) {
      console.log(`  Nenhuma cartela encontrada. Pulando.`);
      continue;
    }

    const existentes = Object.keys(cartela.palpites || {}).length;
    const merge = { ...(cartela.palpites || {}), ...novos };
    const total = Object.keys(merge).length;

    await atualizarCartela(cartela.id, merge);
    console.log(`  OK: ${existentes} → ${total} palpites (+${Object.keys(novos).length} da 1/16)`);
  }

  console.log("\nConcluído!");
}

main().catch(console.error);
