import { JOGOS_GRUPOS } from "../services/jogos";

const LETRAS = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));

function desempate(a, b, timesOrdem) {
  if (b.PTS !== a.PTS) return b.PTS - a.PTS;
  if (b.SG !== a.SG) return b.SG - a.SG;
  if (b.GP !== a.GP) return b.GP - a.GP;
  const iA = timesOrdem.indexOf(a.time);
  const iB = timesOrdem.indexOf(b.time);
  return (iA !== -1 && iB !== -1) ? (iA - iB) : a.time.localeCompare(b.time, "pt-BR");
}

export function calcularGrupo(grupoLetra, resultados) {
  const jogos = JOGOS_GRUPOS.filter(j => j.grupo === `Grupo ${grupoLetra}`);
  const times = [];
  const seen = new Set();
  jogos.forEach(j => {
    for (const t of [j.time_a, j.time_b]) {
      if (!seen.has(t)) { seen.add(t); times.push(t); }
    }
  });

  const stats = Object.fromEntries(times.map(t => [
    t, { time: t, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0, PTS: 0 }
  ]));

  const finalizados = jogos.map(j => ({ jogo: j, res: resultados?.[j.id] }));

  finalizados.forEach(({ jogo: j, res }) => {
    if (res?.placar_a == null) return;
    const ga = Number(res.placar_a), gb = Number(res.placar_b);
    const a = stats[j.time_a], b = stats[j.time_b];
    if (!a || !b) return;
    a.J++; b.J++;
    a.GP += ga; a.GC += gb; a.SG = a.GP - a.GC;
    b.GP += gb; b.GC += ga; b.SG = b.GP - b.GC;
    if (ga > gb) { a.V++; a.PTS += 3; b.D++; }
    else if (ga < gb) { b.V++; b.PTS += 3; a.D++; }
    else { a.E++; a.PTS++; b.E++; b.PTS++; }
  });

  const ordenados = Object.values(stats).sort((a, b) => desempate(a, b, times));

  const pendentes = finalizados.filter(({ res }) => res?.placar_a == null).length;
  const maxPtsPossivel = (3 - pendentes) * 3;
  const jogosRestantes = 3 - pendentes;

  const confirmados = { first: false, second: false, third: false };

  ordenados.forEach((time, i) => {
    if (i === 0 && ordenados.length >= 2) {
      const segundoMax = ordenados[1].PTS + maxPtsPossivel;
      confirmados.first = time.PTS > segundoMax;
    }
    if (i <= 1 && ordenados.length >= 3) {
      const terceiroMax = ordenados[2].PTS + maxPtsPossivel;
      if (time.PTS > terceiroMax) {
        if (i === 0) confirmados.first = true;
        if (i === 1) confirmados.second = true;
      }
    }
    if (i === 2 && ordenados.length >= 4) {
      const quartoMax = ordenados[3].PTS + maxPtsPossivel;
      confirmados.third = time.PTS > quartoMax;
    }
  });

  if (pendentes === 0) {
    confirmados.first = true;
    confirmados.second = true;
    confirmados.third = true;
  }

  return ordenados.map((t, i) => ({
    ...t,
    position: i + 1,
    confirmed: i < 2 ? confirmados[["first", "second"][i]] : (i === 2 ? confirmados.third : false),
    status: i < 2
      ? (confirmados[["first", "second"][i]] ? "classified" : "pending")
      : i === 2
        ? (confirmados.third ? "possible" : "pending")
        : (pendentes === 0 ? "eliminated" : "pending"),
  }));
}

export function allGroupsFinished(resultados) {
  return LETRAS.every(letra => {
    const jogos = JOGOS_GRUPOS.filter(j => j.grupo === `Grupo ${letra}`);
    return jogos.every(j => resultados?.[j.id]?.placar_a != null);
  });
}

export function getStandingsForAllGroups(resultados) {
  return LETRAS.map(letra => ({
    grupo: letra,
    times: calcularGrupo(letra, resultados),
  }));
}
