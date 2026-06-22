import { JOGOS_GRUPOS } from "../services/jogos";
import { calcularGrupo, allGroupsFinished } from "./standings";

const LETRAS = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));

function calculateGroupProgress(resultados) {
  const totalGrupos = 12;
  let finalizados = 0;
  for (const letra of LETRAS) {
    const jogos = JOGOS_GRUPOS.filter(j => j.grupo === `Grupo ${letra}`);
    const count = jogos.filter(j => resultados?.[j.id]?.placar_a != null).length;
    if (count === 6) finalizados++;
  }
  return { finalizados, total: totalGrupos };
}

export function calculateThirdPlaceRanking(resultados) {
  const terminou = allGroupsFinished(resultados);
  if (!terminou) return { ranking: [], finalized: false, progress: calculateGroupProgress(resultados) };

  const terceiros = [];

  for (const letra of LETRAS) {
    const times = calcularGrupo(letra, resultados);
    if (times.length >= 3) {
      terceiros.push({ ...times[2], grupo: letra });
    }
  }

  terceiros.sort((a, b) => {
    if (b.PTS !== a.PTS) return b.PTS - a.PTS;
    if (b.SG !== a.SG) return b.SG - a.SG;
    if (b.GP !== a.GP) return b.GP - a.GP;
    return a.time.localeCompare(b.time, "pt-BR");
  });

  return {
    ranking: terceiros.map((t, i) => ({ ...t, rank: i + 1, advances: i < 8 })),
    finalized: true,
    advancesCount: 8,
    progress: { finalizados: 12, total: 12 },
  };
}

export function getThirdPlaceSlots(resultados) {
  const data = calculateThirdPlaceRanking(resultados);
  if (!data.finalized) return [];

  return data.ranking
    .filter(t => t.advances)
    .map(t => ({
      grupo: t.grupo,
      time: t.time,
      rank: t.rank,
      PTS: t.PTS,
      SG: t.SG,
      GP: t.GP,
    }));
}

export function getThirdPlaceStatus(resultados) {
  const data = calculateThirdPlaceRanking(resultados);
  return data;
}
