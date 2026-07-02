import { JOGOS_1_16 } from "../services/jogos";
import { OITAVAS_MAPPING, QUARTAS_MAPPING, SEMI_MAPPING, FINAL_MAPPING, TERCEIRO_MAPPING } from "./bracketMapping";

function getMatchResult(matchId, resultados) {
  const res = resultados?.[matchId];
  if (!res || res.placar_a == null || res.placar_b == null) return null;
  const ga = Number(res.placar_a), gb = Number(res.placar_b);

  // vitória no tempo normal
  if (ga !== gb) return { winner: ga > gb ? "team1" : "team2", ga, gb };

  // empate — verificar prorrogação
  if (res.pro_a != null && res.pro_b != null) {
    const pa = Number(res.pro_a), pb = Number(res.pro_b);
    if (pa !== pb) return { winner: pa > pb ? "team1" : "team2", ga, gb, pro_a: pa, pro_b: pb };
  }

  // empate — verificar pênaltis
  if (res.pen_a != null && res.pen_b != null) {
    const pa = Number(res.pen_a), pb = Number(res.pen_b);
    if (pa !== pb) return { winner: pa > pb ? "team1" : "team2", ga, gb, pen_a: pa, pen_b: pb };
  }

  return null; // empate sem definição
}

export function getKnockoutState(resultados) {
  const resolvedR32 = {};

  for (const j of JOGOS_1_16) {
    const res = getMatchResult(j.id, resultados);
    const team1 = j.time_a;
    const team2 = j.time_b;
    resolvedR32[j.id] = {
      id: j.id,
      team1,
      team2,
      team1Confirmed: true,
      team2Confirmed: true,
      unlocked: true,
      type: "A",
      result: res,
      winner: res ? (res.winner === "team1" ? team1 : team2) : null,
    };
  }

  function resolvePhase(mapping, prevPhase, _phaseLabel) {
    const result = {};
    for (const m of mapping) {
      const team1Ref = m.slot1.match ? prevPhase[m.slot1.match] : null;
      const team2Ref = m.slot2.match ? prevPhase[m.slot2.match] : null;

      const winner1 = team1Ref?.winner || null;
      const winner2 = team2Ref?.winner || null;

      const resolved = team1Ref?.winner && team2Ref?.winner;
      const unlocked = resolved;

      const res = getMatchResult(m.id, resultados);
      const matchWinner = res
        ? (res.winner === "team1" ? winner1 : winner2)
        : null;

      result[m.id] = {
        id: m.id,
        team1: winner1,
        team2: winner2,
        placeholder1: `Vencedor ${m.slot1.match || ""}`,
        placeholder2: `Vencedor ${m.slot2.match || ""}`,
        team1Confirmed: !!winner1,
        team2Confirmed: !!winner2,
        unlocked,
        result: res,
        winner: matchWinner,
      };
    }
    return result;
  }

  const resolvedOitavas = resolvePhase(OITAVAS_MAPPING, resolvedR32, "Oitavas");
  const resolvedQuartas = resolvePhase(QUARTAS_MAPPING, resolvedOitavas, "Quartas");
  const resolvedSemi = resolvePhase(SEMI_MAPPING, resolvedQuartas, "Semi");
  const resolvedFinal = resolvePhase(FINAL_MAPPING, resolvedSemi, "Final");

  function getLoser(matchObj) {
    if (!matchObj || !matchObj.winner || !matchObj.team1 || !matchObj.team2) return null;
    return matchObj.winner === matchObj.team1 ? matchObj.team2 : matchObj.team1;
  }

  const resolvedTerceiro = {};
  for (const m of TERCEIRO_MAPPING) {
    const sem1 = resolvedSemi[m.slot1.match];
    const sem2 = resolvedSemi[m.slot2.match];
    const loser1 = getLoser(sem1);
    const loser2 = getLoser(sem2);
    const resolved = !!(loser1 && loser2);
    const res = getMatchResult(m.id, resultados);
    const matchWinner = res
      ? (res.winner === "team1" ? loser1 : loser2)
      : null;
    resolvedTerceiro[m.id] = {
      id: m.id,
      team1: loser1,
      team2: loser2,
      team1Confirmed: !!loser1,
      team2Confirmed: !!loser2,
      unlocked: resolved,
      result: res,
      winner: matchWinner,
    };
  }

  return {
    r32: Object.values(resolvedR32).sort((a, b) => {
      const order = JOGOS_1_16.map(j => j.id);
      return order.indexOf(a.id) - order.indexOf(b.id);
    }),
    oitavas: Object.values(resolvedOitavas),
    quartas: Object.values(resolvedQuartas),
    semis: Object.values(resolvedSemi),
    final: Object.values(resolvedFinal),
    terceiro: Object.values(resolvedTerceiro),
    groupsFinished: false,
    thirdFinalized: false,
    standings: [],
  };
}
