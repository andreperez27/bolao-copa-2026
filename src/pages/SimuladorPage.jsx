import React, { useMemo } from "react";
import BracketView from "../components/Bracket/BracketView";
import { getKnockoutState } from "../utils/knockout";
import {
  JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS, JOGOS_SEMI, JOGOS_FINAL,
} from "../services/jogos";
import { NOMES_IA } from "../services/ia";

const jogosInfoMap = {};
for (const j of JOGOS_1_16) jogosInfoMap[j.id] = j;
for (const j of JOGOS_OITAVAS) jogosInfoMap[j.id] = j;
for (const j of JOGOS_QUARTAS) jogosInfoMap[j.id] = j;
for (const j of JOGOS_SEMI) jogosInfoMap[j.id] = j;
for (const j of JOGOS_FINAL) jogosInfoMap[j.id] = j;

export default function SimuladorPage({ resultados, cartelas, jogador, onVoltar }) {
  const knockoutState = useMemo(() => getKnockoutState(resultados || {}), [resultados]);

  const palpites = useMemo(() => {
    if (!jogador?.nome) return {};
    const userCartela = (cartelas || []).find(
      c => c.participante === jogador.nome && !NOMES_IA.includes(c.participante)
    );
    return userCartela?.palpites || {};
  }, [cartelas, jogador]);

  const phases = useMemo(() => {
    if (!knockoutState) return null;
    const mapPhase = (matches) =>
      (matches || []).map(m => ({
        match: m,
        jogoInfo: jogosInfoMap[m.id] || null,
        palpite: palpites[m.id] || null,
      }));
    return {
      r32: mapPhase(knockoutState.r32),
      oit: mapPhase(knockoutState.oitavas),
      qua: mapPhase(knockoutState.quartas),
      sem: mapPhase(knockoutState.semis),
      fin: mapPhase(knockoutState.final),
    };
  }, [knockoutState, palpites]);

  const stats = useMemo(() => {
    if (!phases) return { total: 0, acertos: 0, finalizados: 0 };
    const all = [].concat(phases.r32, phases.oit, phases.qua, phases.sem, phases.fin);
    const finalizados = all.filter(i => i.match?.result);
    const comPalpite = finalizados.filter(i => i.palpite);
    const acertos = comPalpite.filter(i => {
      const m = i.match;
      const p = i.palpite;
      const vencedor = m.winner;
      if (!vencedor) return false;
      const pa = Number(p.gols_a), pb = Number(p.gols_b);
      if (pa == null || pb == null || (isNaN(pa) && isNaN(pb))) return false;
      const palpiteVencedor = pa > pb ? m.team1 : pb > pa ? m.team2 : null;
      return palpiteVencedor === vencedor;
    });
    return { total: all.length, acertos: acertos.length, finalizados: finalizados.length };
  }, [phases]);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A" }}>
      <div style={{
        background: "linear-gradient(135deg, #0033A0, #001a66)",
        padding: "16px 20px 14px",
        borderBottom: "2px solid #FFD700",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onVoltar}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
              color: "#F0F4FF", padding: "6px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            ← Voltar
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
              BOLÃO DA COPA 2026
            </div>
            <div style={{ color: "#F0F4FF", fontSize: 20, fontWeight: 900 }}>
              🏆 Simulador
            </div>
          </div>
        </div>
      </div>

      {jogador && (
        <div style={{
          margin: "12px 16px", padding: "10px 14px",
          background: "rgba(0,51,160,0.1)", border: "1px solid rgba(0,51,160,0.3)",
          borderRadius: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 12, color: "#8B9CC8",
        }}>
          <span>
            <strong style={{ color: "#F0F4FF" }}>Mata-mata:</strong>{" "}
            {stats.acertos} acertos de {stats.finalizados} jogos finalizados
          </span>
          {stats.finalizados > 0 && (
            <span style={{
              background: stats.acertos / stats.finalizados >= 0.5 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: stats.acertos / stats.finalizados >= 0.5 ? "#22c55e" : "#ef4444",
              padding: "2px 8px", borderRadius: 6, fontWeight: 700, fontSize: 13,
            }}>
              {Math.round(stats.acertos / stats.finalizados * 100)}%
            </span>
          )}
        </div>
      )}

      <BracketView phases={phases} />

      <div style={{
        display: "flex", gap: 12, justifyContent: "center", padding: "12px 16px 40px",
        fontSize: 11, color: "#6b7280", flexWrap: "wrap",
      }}>
        <span>🟢 Acertou vencedor</span>
        <span>🔴 Errou</span>
        <span>⚪ Sem palpite</span>
        <span>🔵 Aguardando</span>
      </div>
    </div>
  );
}
