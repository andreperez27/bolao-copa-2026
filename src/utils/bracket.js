import {
  JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS, JOGOS_SEMI, JOGOS_FINAL, JOGOS_TERCEIRO,
} from "../services/jogos";

function resolveVPlaceholder(val) {
  if (!val) return null;
  const found = /^V (\d+)$/.exec(val);
  if (found) {
    const ref = JOGOS_1_16.find(j => j.id === found[1]);
    if (ref) return ref.time_a + " / " + ref.time_b;
  }
  const foundOit = /^V (oit-\d+)$/.exec(val);
  if (foundOit) {
    const ref = JOGOS_OITAVAS.find(j => j.id === foundOit[1]);
    if (ref) {
      const a = resolveVPlaceholder(ref.time_a) || ref.time_a;
      const b = resolveVPlaceholder(ref.time_b) || ref.time_b;
      return a + " / " + b;
    }
  }
  return null;
}
import { OITAVAS_MAPPING, QUARTAS_MAPPING, SEMI_MAPPING, FINAL_MAPPING, TERCEIRO_MAPPING } from "./bracketMapping";

const ALL_MAPPINGS = {
  oit: OITAVAS_MAPPING,
  qua: QUARTAS_MAPPING,
  sem: SEMI_MAPPING,
  fin: FINAL_MAPPING,
  ter: TERCEIRO_MAPPING,
};

const jogosOriginais = {};
for (const j of JOGOS_1_16) jogosOriginais[j.id] = j;
for (const j of JOGOS_OITAVAS) jogosOriginais[j.id] = j;
for (const j of JOGOS_QUARTAS) jogosOriginais[j.id] = j;
for (const j of JOGOS_SEMI) jogosOriginais[j.id] = j;
for (const j of JOGOS_FINAL) jogosOriginais[j.id] = j;
for (const j of JOGOS_TERCEIRO) jogosOriginais[j.id] = j;

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
  const res = { ga, gb };
  if (r.pen_a != null) res.pen_a = Number(r.pen_a);
  if (r.pen_b != null) res.pen_b = Number(r.pen_b);
  if (r.pro_a != null) res.pro_a = Number(r.pro_a);
  if (r.pro_b != null) res.pro_b = Number(r.pro_b);
  return res;
}

export function getVencedorReal(resultados, matchId) {
  const placar = getPlacarReal(resultados, matchId);
  if (!placar) return null;
  if (placar.ga > placar.gb) return "time_a";
  if (placar.gb > placar.ga) return "time_b";
  // empate — verificar prorrogação
  if (placar.pro_a != null && placar.pro_b != null && placar.pro_a !== placar.pro_b) {
    return placar.pro_a > placar.pro_b ? "time_a" : "time_b";
  }
  // empate — verificar pênaltis
  if (placar.pen_a != null && placar.pen_b != null && placar.pen_a !== placar.pen_b) {
    return placar.pen_a > placar.pen_b ? "time_a" : "time_b";
  }
  return null;
}

export function isFinalizado(resultados, matchId) {
  return getPlacarReal(resultados, matchId) !== null;
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
      const real = vencedorReal(match.id);
      if (real) return vencedorParaNome(match.team1, match.team2, real);
      // empate no tempo normal sem definição — usar escolha do usuário
    }
    return vencedorParaNome(match.team1, match.team2, escolhas[match.id]);
  }

  const winnerMap = {};

  const r32 = JOGOS_1_16.map(j => {
    const team1 = j.time_a;
    const team2 = j.time_b;
    const match = { id: j.id, team1, team2, candidates: null, result: placarReal(j.id), winner: null, travado: travado(j.id) };
    match.winner = vencedorEfetivo(match);
    winnerMap[j.id] = match.winner;
    return match;
  });

  function resolvePhase(mappings) {
    return mappings.map(m => {
      const orig = jogosOriginais[m.id];
      let team1 = winnerMap[m.slot1?.match];
      if (!team1 && orig) {
        const r = resolveVPlaceholder(orig.time_a);
        if (r) team1 = r;
        else team1 = orig.time_a;
      }
      let team2 = winnerMap[m.slot2?.match];
      if (!team2 && orig) {
        const r = resolveVPlaceholder(orig.time_b);
        if (r) team2 = r;
        else team2 = orig.time_b;
      }
      const match = { id: m.id, team1, team2, result: placarReal(m.id), winner: null, travado: travado(m.id) };
      match.winner = vencedorEfetivo(match);
      winnerMap[m.id] = match.winner;
      return match;
    });
  }

  const oit = resolvePhase(OITAVAS_MAPPING);
  const qua = resolvePhase(QUARTAS_MAPPING);
  const sem = resolvePhase(SEMI_MAPPING);
  const fin = resolvePhase(FINAL_MAPPING);

  const ter = TERCEIRO_MAPPING.map(m => {
    const sem1 = sem.find(s => s.id === m.slot1.match);
    const sem2 = sem.find(s => s.id === m.slot2.match);
    const team1 = sem1 && sem1.winner && sem1.team1 && sem1.team2
      ? (sem1.winner === sem1.team1 ? sem1.team2 : sem1.team1)
      : null;
    const team2 = sem2 && sem2.winner && sem2.team1 && sem2.team2
      ? (sem2.winner === sem2.team1 ? sem2.team2 : sem2.team1)
      : null;
    const match = { id: m.id, team1, team2, candidates: null, result: placarReal(m.id), winner: null, travado: travado(m.id) };
    match.winner = vencedorEfetivo(match);
    winnerMap[m.id] = match.winner;
    return match;
  });

  return {
    r32,
    oit,
    qua,
    sem,
    fin,
    ter,
  };
}
