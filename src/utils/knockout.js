import { allGroupsFinished, calcularGrupo } from "./standings";
import { calculateThirdPlaceRanking, getThirdPlaceSlots } from "./thirdPlace";
import { R32_MAPPING, OITAVAS_MAPPING, QUARTAS_MAPPING, SEMI_MAPPING, FINAL_MAPPING } from "./bracketMapping";

function getGroupTeam(grupo, pos, standings) {
  const groupData = standings.find(s => s.grupo === grupo);
  if (!groupData) return null;
  const team = groupData.times.find(t => t.position === pos);
  return team || null;
}

function resolveThirdPlace(matchup, thirdSlots) {
  const slotThirdGroups = [matchup.slot1.grupo.replace("3", ""), matchup.slot2.grupo.replace("3", "")];
  const matched = thirdSlots.filter(t => slotThirdGroups.includes(t.grupo));
  return matched.length >= 2
    ? { team1: matched[0], team2: matched[1] }
    : null;
}

function getMatchResult(matchId, resultados) {
  const res = resultados?.[matchId];
  if (!res || res.placar_a == null || res.placar_b == null) return null;
  const ga = Number(res.placar_a), gb = Number(res.placar_b);
  if (ga === gb) return null;
  return { winner: ga > gb ? "team1" : "team2", ga, gb };
}

export function getKnockoutState(resultados) {
  const letras = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));
  const standings = letras.map(letra => ({ grupo: letra, times: calcularGrupo(letra, resultados) }));

  const groupsFinished = allGroupsFinished(resultados);
  const thirdData = calculateThirdPlaceRanking(resultados);
  const thirdSlots = groupsFinished ? getThirdPlaceSlots(resultados) : [];

  const resolvedR32 = {};

  for (const m of R32_MAPPING) {
    let team1 = null, team2 = null;
    let team1Confirmed = false, team2Confirmed = false;
    let unlocked = false;

    if (m.type === "A") {
      const t1 = getGroupTeam(m.slot1.grupo, m.slot1.pos, standings);
      const t2 = getGroupTeam(m.slot2.grupo, m.slot2.pos, standings);
      if (t1) { team1 = t1.time; team1Confirmed = t1.confirmed; }
      if (t2) { team2 = t2.time; team2Confirmed = t2.confirmed; }
      if (t1?.confirmed && t2?.confirmed) {
        unlocked = true;
      }
    } else {
      const resolved = resolveThirdPlace(m, thirdSlots);
      if (resolved && groupsFinished) {
        team1 = resolved.team1.time;
        team2 = resolved.team2.time;
        team1Confirmed = true;
        team2Confirmed = true;
        unlocked = true;
      }
    }

    const res = getMatchResult(m.id, resultados);

    resolvedR32[m.id] = {
      id: m.id,
      team1: team1 || `1º ${m.slot1.grupo}`,
      team2: team2 || (m.type === "B" ? "3º a definir" : `2º ${m.slot2.grupo}`),
      team1Confirmed,
      team2Confirmed,
      unlocked,
      type: m.type,
      result: res,
      winner: res ? (res.winner === "team1" ? team1 : team2) : null,
    };
  }

  function resolvePhase(mapping, prevPhase, phaseLabel) {
    const result = {};
    for (const m of mapping) {
      const team1Ref = m.slot1.match ? prevPhase[m.slot1.match] : null;
      const team2Ref = m.slot2.match ? prevPhase[m.slot2.match] : null;

      const winner1 = team1Ref?.winner || null;
      const winner2 = team2Ref?.winner || null;

      const resolved = team1Ref?.winner && team2Ref?.winner;
      const unlocked = resolved;

      const placeholder1 = `Vencedor ${m.slot1.match || ""}`;
      const placeholder2 = `Vencedor ${m.slot2.match || ""}`;

      const res = getMatchResult(m.id, resultados);
      const matchWinner = res
        ? (res.winner === "team1" ? winner1 : winner2)
        : null;

      result[m.id] = {
        id: m.id,
        team1: winner1,
        team2: winner2,
        placeholder1,
        placeholder2,
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

  return {
    r32: Object.values(resolvedR32).sort((a, b) => {
      const order = R32_MAPPING.map(m => m.id);
      return order.indexOf(a.id) - order.indexOf(b.id);
    }),
    oitavas: Object.values(resolvedOitavas),
    quartas: Object.values(resolvedQuartas),
    semis: Object.values(resolvedSemi),
    final: Object.values(resolvedFinal),
    groupsFinished,
    thirdFinalized: thirdData.finalized,
    standings,
  };
}
