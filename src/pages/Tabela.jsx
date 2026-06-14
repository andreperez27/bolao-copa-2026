import React, { useMemo, useRef, useState } from "react";
import {
  JOGOS_GRUPOS, JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS,
  JOGOS_SEMI, JOGOS_FINAL, ISO,
} from "../services/jogos";

const LETRAS_GRUPOS = Array.from({ length: 12 }, (_, i) =>
  "Grupo " + String.fromCharCode(65 + i)
);

function Flag({ time, size = 18 }) {
  const code = ISO[time];
  if (!code) return <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>🏳</span>;
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={time}
      title={time}
      width={Math.round(size * 1.5)}
      height={size}
      style={{ objectFit: "cover", borderRadius: 2, flexShrink: 0, display: "block" }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

function calcularClassificacao(times, jogos, resultados) {
  const stats = Object.fromEntries(
    times.map(t => [t, { time: t, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0, PTS: 0 }])
  );
  jogos.forEach(j => {
    const res = resultados?.[j.id];
    if (res?.placar_a === null || res?.placar_a === undefined) return;
    const ga = Number(res.placar_a), gb = Number(res.placar_b);
    const a = stats[j.time_a], b = stats[j.time_b];
    if (!a || !b) return;
    a.J++; b.J++;
    a.GP += ga; a.GC += gb; a.SG += ga - gb;
    b.GP += gb; b.GC += ga; b.SG += gb - ga;
    if      (ga > gb) { a.V++; a.PTS += 3; b.D++; }
    else if (ga < gb) { b.V++; b.PTS += 3; a.D++; }
    else              { a.E++; a.PTS++;    b.E++; b.PTS++; }
  });
  return Object.values(stats).sort((a, b) =>
    b.PTS - a.PTS || b.SG - a.SG || b.GP - a.GP ||
    a.time.localeCompare(b.time, "pt-BR")
  );
}

const GRUPOS_MAP = {};
LETRAS_GRUPOS.forEach(g => { GRUPOS_MAP[g] = { times: [], jogos: [] }; });
JOGOS_GRUPOS.forEach(j => {
  const g = GRUPOS_MAP[j.grupo];
  if (!g) return;
  if (!g.times.includes(j.time_a)) g.times.push(j.time_a);
  if (!g.times.includes(j.time_b)) g.times.push(j.time_b);
  g.jogos.push(j);
});

function GrupoCard({ nome, times, jogos, resultados }) {
  const letra   = nome.replace("Grupo ", "");
  const classif = useMemo(
    () => calcularClassificacao(times, jogos, resultados),
    [times, jogos, resultados]
  );

  return (
    <div style={{
      background: "#111827", border: "1px solid #1E2A45",
      borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0d2a5e 70%, #0a1628 100%)",
        padding: "10px 12px 10px",
        borderBottom: "2px solid rgba(255,215,0,0.2)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 10,
        }}>
          <div style={{
            width: 3, height: 14, background: "#FFD700",
            borderRadius: 2, flexShrink: 0,
          }}/>
          <span style={{
            color: "#FFD700", fontWeight: 900, fontSize: 12,
            letterSpacing: 2, textTransform: "uppercase",
          }}>GRUPO {letra}</span>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
        }}>
          {times.map((t, i) => (
            <div key={t} style={{
              display: "flex", alignItems: "center", gap: 7,
              background: i < 2
                ? "rgba(22,163,74,0.15)"
                : "rgba(255,255,255,0.04)",
              border: i < 2
                ? "1px solid rgba(22,163,74,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8, padding: "5px 8px",
              minWidth: 0,
            }}>
              <Flag time={t} size={20} />
              {i < 2 && (
                <span style={{
                  fontSize: 8, background: "#16a34a", color: "#fff",
                  borderRadius: 3, padding: "1px 4px", fontWeight: 700,
                  flexShrink: 0, lineHeight: 1.6,
                }}>✓</span>
              )}
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 9, color: "#4B5563", marginTop: 6,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{
            display: "inline-block", width: 8, height: 8,
            background: "#16a34a", borderRadius: 2,
          }}/>
          Classificado para as oitavas
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #1E2A45" }}>
        {jogos.map(j => {
          const res = resultados?.[j.id];
          const ok  = res?.placar_a !== null && res?.placar_a !== undefined;
          return (
            <div key={j.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 58px 1fr",
              alignItems: "center",
              padding: "5px 10px",
              borderBottom: "1px solid rgba(30,42,69,0.35)",
              gap: 4,
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                gap: 5, justifyContent: "flex-end", minWidth: 0,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#F0F4FF",
                  textAlign: "right", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{j.time_a}</span>
                <Flag time={j.time_a} size={13} />
              </div>

              <div style={{ textAlign: "center" }}>
                {ok ? (
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 2,
                  }}>
                    <span style={{
                      background: "#0A0E1A", border: "1px solid #1E2A45",
                      borderRadius: 4, width: 22, height: 22,
                      display: "inline-flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 900,
                      fontSize: 12, color: "#FFD700",
                    }}>{res.placar_a}</span>
                    <span style={{ color: "#4B5563", fontSize: 9 }}>×</span>
                    <span style={{
                      background: "#0A0E1A", border: "1px solid #1E2A45",
                      borderRadius: 4, width: 22, height: 22,
                      display: "inline-flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 900,
                      fontSize: 12, color: "#FFD700",
                    }}>{res.placar_b}</span>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      fontSize: 8, color: "#4B5563", fontWeight: 700,
                      letterSpacing: 0.3, lineHeight: 1.4,
                    }}>{j.horario_brasilia.split(" ")[0]}</div>
                    <div style={{
                      fontSize: 11, color: "#8B9CC8", fontWeight: 800,
                    }}>{j.horario_brasilia.split(" ")[1]}</div>
                  </div>
                )}
              </div>

              <div style={{
                display: "flex", alignItems: "center",
                gap: 5, minWidth: 0,
              }}>
                <Flag time={j.time_b} size={13} />
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#F0F4FF",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{j.time_b}</span>
              </div>
            </div>
          );
        })}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr style={{ background: "rgba(0,51,160,0.15)" }}>
            <th colSpan={2} style={{
              padding: "4px 4px 4px 8px", textAlign: "left",
              color: "#4B5563", fontSize: 8, fontWeight: 700, letterSpacing: 1,
            }}>CLASSIFICAÇÃO</th>
            {["J","V","E","D","GP","GC","SG"].map(h => (
              <th key={h} style={{
                padding: "4px 3px", textAlign: "center",
                color: "#4B5563", fontSize: 8, fontWeight: 700,
              }}>{h}</th>
            ))}
            <th style={{
              padding: "4px 5px 4px 3px", textAlign: "center",
              color: "#FFD700", fontSize: 8, fontWeight: 700,
            }}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {classif.map((r, i) => (
            <tr key={r.time} style={{
              borderBottom: "1px solid rgba(30,42,69,0.25)",
              background: i < 2 ? "rgba(22,163,74,0.04)" : "transparent",
            }}>
              <td style={{
                padding: "5px 3px 5px 0",
                borderLeft: `3px solid ${i < 2 ? "#16a34a" : "transparent"}`,
                width: 18, textAlign: "center",
                color: i < 2 ? "#22c55e" : "#4B5563",
                fontWeight: 900, fontSize: 9,
              }}>{i + 1}</td>
              <td style={{ padding: "5px 4px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Flag time={r.time} size={13} />
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: i < 2 ? "#F0F4FF" : "#8B9CC8",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", maxWidth: 90,
                    display: "block",
                  }}>{r.time}</span>
                </div>
              </td>
              {[r.J, r.V, r.E, r.D, r.GP, r.GC, r.SG].map((v, ci) => (
                <td key={ci} style={{
                  padding: "5px 3px", textAlign: "center",
                  color: "#8B9CC8", fontWeight: 600, fontSize: 10,
                }}>
                  {ci === 6 && v > 0 ? `+${v}` : v}
                </td>
              ))}
              <td style={{
                padding: "5px 5px 5px 3px", textAlign: "center",
                fontWeight: 900, fontSize: 13, color: "#FFD700",
              }}>{r.PTS}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KoJogo({ jogo, resultados, isFinal }) {
  const res = resultados?.[jogo.id];
  const ok  = res?.placar_a !== null && res?.placar_a !== undefined;
  const isHolder = n => !n || /^[12]º/.test(n) || /^[VM]/.test(n) ||
    ["Venc","Sem","Qua","Oit","3º"].some(p => n.includes(p));

  const lados = [
    { nome: jogo.time_a, gol: ok ? res.placar_a : null },
    { nome: jogo.time_b, gol: ok ? res.placar_b : null },
  ];
  const vencedor = ok && Number(res.placar_a) !== Number(res.placar_b)
    ? (Number(res.placar_a) > Number(res.placar_b) ? jogo.time_a : jogo.time_b)
    : null;

  return (
    <div style={{
      background: "#111827",
      border: `1px solid ${isFinal ? "#FFD700" : "#1E2A45"}`,
      borderRadius: 10, overflow: "hidden",
      boxShadow: isFinal ? "0 0 20px rgba(255,215,0,0.12)" : "none",
    }}>
      <div style={{
        padding: "3px 8px", fontSize: 9, textAlign: "center", fontWeight: 700,
        letterSpacing: 0.5,
        background: isFinal ? "rgba(255,215,0,0.12)" : "rgba(0,51,160,0.2)",
        color: isFinal ? "#FFD700" : "#8B9CC8",
      }}>{jogo.horario_brasilia}</div>

      {lados.map((l, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "5px 10px",
          borderBottom: i === 0 ? "1px solid rgba(30,42,69,0.5)" : "none",
          background: l.nome === vencedor ? "rgba(255,215,0,0.05)" : "transparent",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            flex: 1, minWidth: 0,
          }}>
            {!isHolder(l.nome) && <Flag time={l.nome} size={14} />}
            <span style={{
              fontSize: 11, fontWeight: l.nome === vencedor ? 800 : 600,
              color: l.nome === vencedor ? "#FFD700" : "#F0F4FF",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{l.nome}</span>
          </div>
          <div style={{
            background: "#0A0E1A", border: "1px solid #1E2A45",
            borderRadius: 4, width: 22, height: 22, display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginLeft: 8, fontWeight: 900, fontSize: 12,
            color: l.gol !== null
              ? (isFinal ? "#FFD700" : l.nome === vencedor ? "#22c55e" : "#F0F4FF")
              : "#4B5563",
          }}>
            {l.gol !== null ? l.gol : "·"}
          </div>
        </div>
      ))}
    </div>
  );
}

function resolverTimes(jogos, resultados, avancos = {}) {
  return jogos.map(j => {
    const ta  = avancos[j.time_a] || j.time_a;
    const tb  = avancos[j.time_b] || j.time_b;
    const res = resultados?.[j.id];
    return { ...j, time_a: ta, time_b: tb, res };
  });
}

function vencedorDe(jogo) {
  if (!jogo?.res) return null;
  const ga = Number(jogo.res.placar_a), gb = Number(jogo.res.placar_b);
  if (isNaN(ga) || isNaN(gb) || ga === gb) return null;
  return ga > gb ? jogo.time_a : jogo.time_b;
}

function gerarHTMLDownload(innerHtml, campeoReal) {
  const data = new Date().toLocaleDateString("pt-BR");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Tabela Copa 2026 — Bolão ANPEREZ</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0A0E1A;color:#F0F4FF;font-family:Arial,Helvetica,sans-serif;padding:16px;}
img{display:inline-block;vertical-align:middle;}
table{border-collapse:collapse;width:100%;}
</style>
</head>
<body>
<div style="text-align:center;padding:20px 0 24px;border-bottom:2px solid #FFD700;margin-bottom:20px;">
  <div style="color:#FFD700;font-size:11px;font-weight:700;letter-spacing:3px;">COPA DO MUNDO 2026</div>
  <div style="color:#F0F4FF;font-size:26px;font-weight:900;">Tabela Oficial</div>
  <div style="color:#8B9CC8;font-size:11px;margin-top:6px;">
    Bolão ANPEREZ · ${data}${campeoReal ? " · 🏆 " + campeoReal : ""}
  </div>
</div>
${innerHtml}
<div style="text-align:center;padding:24px;color:#4B5563;font-size:10px;margin-top:20px;">
  Horários em BRT (Brasília) · Bolão ANPEREZ 2026
</div>
</body>
</html>`;
}

export default function Tabela({ resultados, campeoReal, onVoltar }) {
  const tabelaRef = useRef(null);
  const gruposEntries = useMemo(() => Object.entries(GRUPOS_MAP), []);

  const finalTerminou = useMemo(() => {
    const fin = JOGOS_FINAL[0];
    if (!fin) return false;
    const r = resultados?.[fin.id];
    return r?.placar_a !== null && r?.placar_a !== undefined;
  }, [resultados]);

  const { dezesseisavos, oitavas, quartas, semis, final: finalJogos } = useMemo(() => {
    const avancos = {};
    Object.entries(GRUPOS_MAP).forEach(([nome, g]) => {
      const letra = nome.replace("Grupo ", "");
      const cl = calcularClassificacao(g.times, g.jogos, resultados);
      if (cl.length >= 2) {
        avancos[`1${letra}`] = cl[0].time;
        avancos[`2${letra}`] = cl[1].time;
        if (cl[2]) avancos[`3${letra}`] = cl[2].time;
      }
    });

    const dez = resolverTimes(JOGOS_1_16, resultados, avancos);

    const oit = resolverTimes(JOGOS_OITAVAS, resultados, avancos);
    const avancos2 = {};
    oit.forEach(j => {
      const v = vencedorDe(j);
      if (v) avancos2[`V ${j.id}`] = v;
      const alias = j.id.replace("oit-","Oit").replace(/(\d+)/, n => n);
      avancos2[`V Oit${j.id.replace("oit-","")}`] = v || j.time_a;
    });

    const qua = resolverTimes(JOGOS_QUARTAS, resultados, avancos2);
    const avancos3 = {};
    qua.forEach(j => {
      const v = vencedorDe(j);
      if (v) avancos3[`V Qua${j.id.replace("qua-","")}`] = v;
    });

    const sem = resolverTimes(JOGOS_SEMI, resultados, avancos3);
    const avancos4 = {};
    sem.forEach(j => {
      const v = vencedorDe(j);
      if (v) avancos4[`V Sem${j.id.replace("sem-","")}`] = v;
    });

    const fin = resolverTimes(JOGOS_FINAL, resultados, { ...avancos3, ...avancos4,
      "V Sem1/2": avancos4["V Sem1"] || avancos4["V Sem2"] || "V Semi 1/2",
      "V Sem3/4": avancos4["V Sem3"] || avancos4["V Sem4"] || "V Semi 3/4",
    });

    return { dezesseisavos: dez, oitavas: oit, quartas: qua, semis: sem, final: fin };
  }, [resultados]);

  const handleDownload = () => {
    const html = tabelaRef.current?.innerHTML || "";
    const doc  = gerarHTMLDownload(html, campeoReal);
    const blob = new Blob([doc], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `tabela-copa-2026${finalTerminou ? "-final" : ""}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fases = [
    { titulo: "SEGUNDA RODADA",   jogos: dezesseisavos, isFinal: false },
    { titulo: "OITAVAS DE FINAL", jogos: oitavas,       isFinal: false },
    { titulo: "QUARTAS DE FINAL", jogos: quartas,       isFinal: false },
    { titulo: "SEMIFINAIS",       jogos: semis,         isFinal: false },
    { titulo: "\uD83C\uDFC6 GRANDE FINAL", jogos: finalJogos, isFinal: true  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", paddingBottom: 80 }}>

      <div style={{
        background: "linear-gradient(135deg, #0A1628, #0d2145, #0A1628)",
        borderBottom: "3px solid #FFD700",
        padding: "12px 16px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          maxWidth: 960, margin: "0 auto",
        }}>
          <button onClick={onVoltar} style={{
            background: "rgba(255,255,255,0.08)", border: "none",
            borderRadius: 8, color: "#F0F4FF", padding: "7px 12px",
            cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>← Voltar</button>

          <div style={{ flex: 1 }}>
            <div style={{
              color: "#FFD700", fontSize: 9, fontWeight: 700, letterSpacing: 2,
            }}>COPA DO MUNDO 2026</div>
            <div style={{
              color: "#F0F4FF", fontSize: 17, fontWeight: 900, lineHeight: 1.1,
            }}>Tabela</div>
          </div>

          <button onClick={handleDownload} style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: finalTerminou
              ? "linear-gradient(135deg, #B8860B, #FFD700)"
              : "rgba(0,51,160,0.5)",
            border: finalTerminou ? "none" : "1px solid #0033A0",
            color: finalTerminou ? "#000" : "#F0F4FF",
            fontWeight: 700, fontSize: 12, padding: "7px 14px",
            borderRadius: 999, cursor: "pointer",
            boxShadow: finalTerminou ? "0 0 16px rgba(255,215,0,0.3)" : "none",
          }}>
            {finalTerminou ? "\uD83C\uDFC6 Recordação" : "\uD83D\uDCE5 Baixar"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 14px" }}>

        {campeoReal && finalTerminou && (
          <div style={{
            background: "linear-gradient(135deg, #1a1200, #2a1f00)",
            border: "2px solid #FFD700", borderRadius: 16, padding: "20px",
            marginBottom: 20, textAlign: "center",
            boxShadow: "0 0 40px rgba(255,215,0,0.15)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
            <div style={{
              color: "#FFD700", fontSize: 11, fontWeight: 700,
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
            }}>Campeão do Mundo 2026</div>
            <div style={{ display: "flex", alignItems: "center",
              justifyContent: "center", gap: 12 }}>
              <Flag time={campeoReal} size={40} />
              <span style={{ fontSize: 26, fontWeight: 900, color: "#FFD700" }}>
                {campeoReal}
              </span>
            </div>
          </div>
        )}

        <div ref={tabelaRef}>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 18 }}>⚽</span>
            <span style={{
              fontSize: 14, fontWeight: 800, color: "#FFD700", letterSpacing: 1.5,
            }}>FASE DE GRUPOS</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14, marginBottom: 32,
          }}>
            {gruposEntries.map(([nome, g]) => (
              <GrupoCard
                key={nome} nome={nome}
                times={g.times} jogos={g.jogos}
                resultados={resultados}
              />
            ))}
          </div>

          {fases.map(f => (
            <div key={f.titulo}>
              <div style={{
                fontSize: 14, fontWeight: 800, letterSpacing: 1.5,
                color: f.isFinal ? "#FFD700" : "#F0F4FF",
                borderLeft: `4px solid ${f.isFinal ? "#FFD700" : "#0033A0"}`,
                paddingLeft: 10, marginTop: 28, marginBottom: 12,
              }}>{f.titulo}</div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
              }}>
                {f.jogos.map(j => (
                  <KoJogo
                    key={j.id} jogo={j}
                    resultados={resultados} isFinal={f.isFinal}
                  />
                ))}
              </div>
            </div>
          ))}

          <div style={{
            color: "#4B5563", fontSize: 9, marginTop: 20,
            textAlign: "center", letterSpacing: 0.5,
          }}>
            Horários em BRT (Brasília) · ✓ classificado para as oitavas ·
            Bolão ANPEREZ
          </div>
        </div>
      </div>
    </div>
  );
}
