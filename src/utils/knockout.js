import { JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS, JOGOS_SEMI, JOGOS_FINAL, JOGOS_TERCEIRO } from "../services/jogos";
import { R32_MAPPING, OITAVAS_MAPPING, QUARTAS_MAPPING, SEMI_MAPPING, FINAL_MAPPING, TERCEIRO_MAPPING } from "./bracketMapping";

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
import { getStandingsForAllGroups } from "./standings";
import { calculateThirdPlaceRanking } from "./thirdPlace";

function getMatchResult(matchId, resultados) {
  const res = resultados?.[matchId];
  if (!res || res.placar_a == null || res.placar_b == null) return null;
  const ga = Number(res.placar_a), gb = Number(res.placar_b);

  if (ga !== gb) return { winner: ga > gb ? "team1" : "team2", ga, gb };

  if (res.pro_a != null && res.pro_b != null) {
    const pa = Number(res.pro_a), pb = Number(res.pro_b);
    if (pa !== pb) return { winner: pa > pb ? "team1" : "team2", ga, gb, pro_a: pa, pro_b: pb };
  }

  if (res.pen_a != null && res.pen_b != null) {
    const pa = Number(res.pen_a), pb = Number(res.pen_b);
    if (pa !== pb) return { winner: pa > pb ? "team1" : "team2", ga, gb, pen_a: pa, pen_b: pb };
  }

  return null;
}

export function getKnockoutState(resultados) {
  const allStandings = getStandingsForAllGroups(resultados);
  const groupTeams = {};
  for (const g of allStandings) {
    groupTeams[g.grupo] = g.times.map(t => t.time);
  }

  const thirdPlaceData = calculateThirdPlaceRanking(resultados);
  const thirdPlaceRanking = thirdPlaceData.finalized ? thirdPlaceData.ranking : [];

  function resolvePoolTeams(poolGroups) {
    const items = [];
    for (const g of poolGroups) {
      const raw = allStandings.find(s => s.grupo === g)?.times?.[2];
      if (raw) items.push(raw);
    }
    if (items.length === 0) return null;
    items.sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS;
      if (b.SG !== a.SG) return b.SG - a.SG;
      if (b.GP !== a.GP) return b.GP - a.GP;
      return a.time.localeCompare(b.time, "pt-BR");
    });
    return items[0].time;
  }

  function resolveSlot(slot) {
    if (slot.grupo) {
      const teams = groupTeams[slot.grupo];
      if (!teams || teams.length < slot.pos) return null;
      return teams[slot.pos - 1] || null;
    }
    if (slot.pool && slot.pos === 3) {
      if (slot.pool.length === 1) {
        const teams = groupTeams[slot.pool[0]];
        if (!teams || teams.length < 3) return null;
        const t3 = teams[2];
        if (!t3) return null;
        if (thirdPlaceRanking.length > 0) {
          return thirdPlaceRanking.find(t => t.time === t3) ? t3 : null;
        }
        return t3;
      }
      const candidates = thirdPlaceRanking.filter(t => slot.pool.includes(t.grupo));
      if (candidates.length > 0) return candidates[0].time;
      return resolvePoolTeams(slot.pool);
    }
    return null;
  }

  const jogosOriginais1_16 = {};
  for (const j of JOGOS_1_16) jogosOriginais1_16[j.id] = j;

  const resolvedR32 = {};
  for (const m of R32_MAPPING) {
    const orig = jogosOriginais1_16[m.id];
    const team1 = orig?.time_a || resolveSlot(m.slot1) || null;
    const team2 = orig?.time_b || resolveSlot(m.slot2) || null;
    const res = getMatchResult(m.id, resultados);
    resolvedR32[m.id] = {
      id: m.id,
      team1,
      team2,
      team1Confirmed: !!team1,
      team2Confirmed: !!team2,
      unlocked: !!(team1 && team2),
      result: res,
      winner: res ? (res.winner === "team1" ? team1 : team2) : null,
    };
  }

  function resolvePhase(mapping, prevPhase) {
    const result = {};
    for (const m of mapping) {
      const team1Ref = m.slot1.match ? prevPhase[m.slot1.match] : null;
      const team2Ref = m.slot2.match ? prevPhase[m.slot2.match] : null;
      let team1 = team1Ref?.winner || null;
      let team2 = team2Ref?.winner || null;
      if (!team1 && m.slot1?.match) team1 = resolveVPlaceholder("V " + m.slot1.match);
      if (!team2 && m.slot2?.match) team2 = resolveVPlaceholder("V " + m.slot2.match);
      const resolved = !!(team1 && team2);
      const res = getMatchResult(m.id, resultados);
      const matchWinner = res
        ? (res.winner === "team1" ? team1 : team2)
        : null;
      result[m.id] = {
        id: m.id,
        team1,
        team2,
        team1Confirmed: !!team1,
        team2Confirmed: !!team2,
        unlocked: resolved,
        result: res,
        winner: matchWinner,
      };
    }
    return result;
  }

  const resolvedOitavas = resolvePhase(OITAVAS_MAPPING, resolvedR32);
  const resolvedQuartas = resolvePhase(QUARTAS_MAPPING, resolvedOitavas);
  const resolvedSemi = resolvePhase(SEMI_MAPPING, resolvedQuartas);
  const resolvedFinal = resolvePhase(FINAL_MAPPING, resolvedSemi);

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
    groupsFinished: thirdPlaceData.finalized,
    thirdFinalized: thirdPlaceData.finalized,
    standings: allStandings,
  };
}
