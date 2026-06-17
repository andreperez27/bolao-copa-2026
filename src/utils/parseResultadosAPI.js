import { JOGOS_TODOS, normalizarNomePais } from "../services/jogos";

export const API_URLS = [
  "https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026/worldcup.json",
  "https://worldcup26.ir/get/games",
  "https://worldcupjson.net/matches",
];

export const API_URL_PADRAO = API_URLS[0];

function extrairMatches(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.matches)) return data.matches;
  return data.games || data.data || data.results || [];
}

function lerTimes(m) {
  if (typeof m.team1 === "string") return [m.team1, m.team2];
  const homeStr = m.home_name || m.home_team_name_en || "";
  const awayStr = m.away_name || m.away_team_name_en || "";
  if (homeStr) return [homeStr, awayStr];
  const home = m.home_team || m.homeTeam || {};
  const away = m.away_team || m.awayTeam || {};
  return [
    home.name || home.country || home.team_name || "",
    away.name || away.country || away.team_name || "",
  ];
}

function lerPlacar(m) {
  if (m.score?.ft && Array.isArray(m.score.ft) && m.score.ft.length === 2) {
    return [m.score.ft[0], m.score.ft[1]];
  }
  if (m.score_home !== undefined) return [m.score_home, m.score_away];
  const ga = m.home_score ?? m.goals_home ?? m.homeTeam?.goals ?? m.score?.fullTime?.home ?? m.homeScore;
  const gb = m.away_score ?? m.goals_away ?? m.awayTeam?.goals ?? m.score?.fullTime?.away ?? m.awayScore;
  return [ga, gb];
}

function finalizado(m) {
  if (m.score?.ft && Array.isArray(m.score.ft)) return true;
  if (m.finished === true || m.finished === "TRUE") return true;
  const st = (m.status || m.matchStatus || m.match_status || "").toLowerCase();
  return ["finished", "ft", "completed", "fim", "encerrado", "full-time"].includes(st);
}

export function parseResultadosDeAPI(data) {
  const novos = {};
  const matches = extrairMatches(data);
  if (!matches.length) return novos;

  matches.forEach((m) => {
    if (!finalizado(m)) return;
    const [rawA, rawB] = lerTimes(m);
    if (!rawA || !rawB) return;
    const [ga, gb] = lerPlacar(m);
    if (ga === null || ga === undefined || gb === null || gb === undefined) return;

    const nomeA = normalizarNomePais(rawA.trim());
    const nomeB = normalizarNomePais(rawB.trim());

    JOGOS_TODOS.forEach((j) => {
      const jA = normalizarNomePais(j.time_a).toLowerCase();
      const jB = normalizarNomePais(j.time_b).toLowerCase();
      const aLow = nomeA.toLowerCase();
      const bLow = nomeB.toLowerCase();
      if (
        (jA.includes(aLow) || aLow.includes(jA)) &&
        (jB.includes(bLow) || bLow.includes(jB))
      ) {
        novos[j.id] = { placar_a: Number(ga), placar_b: Number(gb) };
      }
    });
  });

  return novos;
}

export async function fetchResultadosDeURL(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    if (res.ok) return await res.json();
  } catch {}

  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.json();
    } catch {}
  }

  throw new Error("Não foi possível acessar: " + url);
}
