import {
  JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS, JOGOS_SEMI, JOGOS_FINAL,
} from "../services/jogos";
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

function winnerTeamName(team1, team2, lado) {
  if (lado === "time_a") return team1;
  if (lado === "time_b") return team2;
  return null;
}

export function resolveInteractiveBracket(resultados, escolhas, knockoutBase) {
  if (!knockoutBase) return null;

  const placarReal = (id) => getPlacarReal(resultados, id);
  const travado = (id) => isFinalizado(resultados, id);
  const winnerFromResult = (id) => getVencedorReal(resultados, id);

  function resolveMatchWinner(match) {
    if (travado(match.id)) {
      const lado = winnerFromResult(match.id);
      return winnerTeamName(match.team1, match.team2, lado);
    }
    const lado = escolhas[match.id];
    return winnerTeamName(match.team1, match.team2, lado);
  }

  const r32 = R32_MAPPING.map(m => {
    const base = (knockoutBase.r32 || []).find(x => x.id === m.id) || {};
    const original = jogosOriginais[m.id];
    const team1 = base.team1 || (original ? original.time_a : null);
    const team2 = base.team2 || (original ? original.time_b : null);
    return {
      id: m.id,
      team1, team2,
      result: placarReal(m.id),
      winner: null,
      travado: travado(m.id),
    };
  });
  for (const m of r32) m.winner = resolveMatchWinner(m);

  const winnerMap = {};
  for (const m of r32) winnerMap[m.id] = m.winner;

  function resolvePhase(mappings, phaseKey) {
    return mappings.map(m => {
      const upstream1 = winnerMap[m.slot1?.match];
      const upstream2 = winnerMap[m.slot2?.match];
      const original = jogosOriginais[m.id];
      const team1 = upstream1 || (original ? original.time_a : null);
      const team2 = upstream2 || (original ? original.time_b : null);
      const match = {
        id: m.id, team1, team2,
        result: placarReal(m.id),
        winner: null,
        travado: travado(m.id),
      };
      match.winner = resolveMatchWinner(match);
      winnerMap[m.id] = match.winner;
      return match;
    });
  }

  return {
    r32,
    oit: resolvePhase(OITAVAS_MAPPING, "oit"),
    qua: resolvePhase(QUARTAS_MAPPING, "qua"),
    sem: resolvePhase(SEMI_MAPPING, "sem"),
    fin: resolvePhase(FINAL_MAPPING, "fin"),
  };
}
