import {
  JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS, JOGOS_SEMI, JOGOS_FINAL,
  JOGOS_GRUPOS,
} from "../services/jogos";
import { calcularGrupo } from "./standings";
import { OITAVAS_MAPPING, QUARTAS_MAPPING, SEMI_MAPPING, FINAL_MAPPING, R32_MAPPING } from "./bracketMapping";

const ALL_MAPPINGS = {
  oit: OITAVAS_MAPPING,
  qua: QUARTAS_MAPPING,
  sem: SEMI_MAPPING,
  fin: FINAL_MAPPING,
};

const jogosOriginais = {};
for (const j of JOGOS_1_16) jogosOriginais[j.id] = j;
for (const j of JOGOS_OITAVAS) jogosOriginais[j.id] = j;
for (const j of JOGOS_QUARTAS) jogosOriginais[j.id] = j;
for (const j of JOGOS_SEMI) jogosOriginais[j.id] = j;
for (const j of JOGOS_FINAL) jogosOriginais[j.id] = j;

export function getDependentes(jogoId) {
  const all = Object.values(ALL_MAPPINGS).flat();
  const direct = all
    .filter(m => m.slot1?.match === jogoId || m.slot2?.match === jogoId)
    .map(m => m.id);
  const nested = direct.flatMap(id => getDependentes(id));
  return [...new Set([...direct, ...nested])];
}

export function getPlacarReal(resultados, matchId) {
  const r = resultados?.[matchId];
  if (r == null) return null;
  const ga = Number(r.placar_a);
  const gb = Number(r.placar_b);
  if (isNaN(ga) || isNaN(gb)) return null;
  return { ga, gb };
}

export function getVencedorReal(resultados, matchId) {
  const placar = getPlacarReal(resultados, matchId);
  if (!placar) return null;
  if (placar.ga > placar.gb) return "time_a";
  if (placar.gb > placar.ga) return "time_b";
  return null;
}

export function isFinalizado(resultados, matchId) {
  return getPlacarReal(resultados, matchId) !== null;
}

function timeNaPosicao(grupoLetra, pos, resultados) {
  const data = calcularGrupo(grupoLetra, resultados);
  const t = data?.find(x => x.position === pos);
  return t ? t.time : null;
}

function vencedorParaNome(team1, team2, lado) {
  if (lado === "time_a") return team1;
  if (lado === "time_b") return team2;
  return null;
}

export function resolveInteractiveBracket(resultados, escolhas) {
  const placarReal = (id) => getPlacarReal(resultados, id);
  const travado = (id) => isFinalizado(resultados, id);
  const vencedorReal = (id) => getVencedorReal(resultados, id);

  function vencedorEfetivo(match) {
    if (travado(match.id)) {
      return vencedorParaNome(match.team1, match.team2, vencedorReal(match.id));
    }
    return vencedorParaNome(match.team1, match.team2, escolhas[match.id]);
  }

  const winnerMap = {};

  const r32 = R32_MAPPING.map(m => {
    const orig = jogosOriginais[m.id];
    let team1 = orig ? orig.time_a : null;
    let team2 = orig ? orig.time_b : null;
    if (m.slot1?.grupo) {
      team1 = timeNaPosicao(m.slot1.grupo, m.slot1.pos, resultados) || team1;
    }
    if (m.type === "A" && m.slot2?.grupo) {
      team2 = timeNaPosicao(m.slot2.grupo, m.slot2.pos, resultados) || team2;
    }
    if (m.type === "B" && m.slot2?.pool) {
      const allStandings = "ABCDEFGHIJKL".split("").map(g => ({ grupo: g, times: calcularGrupo(g, resultados) }));
      const thirdRanked = allStandings
        .map(s => ({ grupo: s.grupo, third: s.times?.find(x => x.position === 3) }))
        .filter(x => x.third)
        .sort((a, b) => (b.third?.PTS || 0) - (a.third?.PTS || 0) || (b.third?.SG || 0) - (a.third?.SG || 0) || (b.third?.GP || 0) - (a.third?.GP || 0));
      const eligible = thirdRanked.filter(t => m.slot2.pool.includes(t.grupo));
      const best = eligible[Math.floor(m.slot2.pos === 3 ? 0 : 0)];
      if (best) team2 = best.third.time;
    }
    const match = { id: m.id, team1, team2, result: placarReal(m.id), winner: null, travado: travado(m.id) };
    match.winner = vencedorEfetivo(match);
    winnerMap[m.id] = match.winner;
    return match;
  });

  function resolvePhase(mappings) {
    return mappings.map(m => {
      const orig = jogosOriginais[m.id];
      const team1 = winnerMap[m.slot1?.match] || (orig ? orig.time_a : null);
      const team2 = winnerMap[m.slot2?.match] || (orig ? orig.time_b : null);
      const match = { id: m.id, team1, team2, result: placarReal(m.id), winner: null, travado: travado(m.id) };
      match.winner = vencedorEfetivo(match);
      winnerMap[m.id] = match.winner;
      return match;
    });
  }

  return {
    r32,
    oit: resolvePhase(OITAVAS_MAPPING),
    qua: resolvePhase(QUARTAS_MAPPING),
    sem: resolvePhase(SEMI_MAPPING),
    fin: resolvePhase(FINAL_MAPPING),
  };
}
