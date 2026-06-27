import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import BracketView from "../components/Bracket/BracketView";
import { getKnockoutState } from "../utils/knockout";
import { resolveInteractiveBracket, getDependentes } from "../utils/bracket";
import {
  JOGOS_1_16, JOGOS_OITAVAS, JOGOS_QUARTAS, JOGOS_SEMI, JOGOS_FINAL,
} from "../services/jogos";

const jogosInfoMap = {};
for (const j of JOGOS_1_16) jogosInfoMap[j.id] = j;
for (const j of JOGOS_OITAVAS) jogosInfoMap[j.id] = j;
for (const j of JOGOS_QUARTAS) jogosInfoMap[j.id] = j;
for (const j of JOGOS_SEMI) jogosInfoMap[j.id] = j;
for (const j of JOGOS_FINAL) jogosInfoMap[j.id] = j;

const STORAGE_KEY = "bolao_bracket_escolhas";

export default function SimuladorPage({ resultados, onVoltar }) {
  const fileInputRef = useRef(null);

  const [escolhas, setEscolhas] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(escolhas));
  }, [escolhas]);

  const knockoutBase = useMemo(() => getKnockoutState(resultados || {}), [resultados]);

  const bracketData = useMemo(
    () => resolveInteractiveBracket(resultados || {}, escolhas, knockoutBase),
    [resultados, escolhas, knockoutBase]
  );

  const phases = useMemo(() => {
    if (!bracketData) return null;
    const mapPhase = (matches) =>
      (matches || []).map(m => ({
        match: m,
        jogoInfo: jogosInfoMap[m.id] || null,
      }));
    return {
      r32: mapPhase(bracketData.r32),
      oit: mapPhase(bracketData.oit),
      qua: mapPhase(bracketData.qua),
      sem: mapPhase(bracketData.sem),
      fin: mapPhase(bracketData.fin),
    };
  }, [bracketData]);

  const progresso = useMemo(() => {
    if (!bracketData) return { escolhidos: 0, total: 0 };
    const all = [].concat(bracketData.r32, bracketData.oit, bracketData.qua, bracketData.sem, bracketData.fin);
    const escolhidos = all.filter(m => m.winner || m.travado).length;
    return { escolhidos, total: all.length };
  }, [bracketData]);

  const handleEscolha = useCallback((jogoId, lado) => {
    setEscolhas(prev => {
      if (lado === null) {
        const { [jogoId]: _, ...rest } = prev;
        return rest;
      }
      if (prev[jogoId] === lado) return prev;
      const dependentes = getDependentes(jogoId);
      const novo = { ...prev, [jogoId]: lado };
      dependentes.forEach(id => delete novo[id]);
      return novo;
    });
  }, []);

  const handleReset = useCallback(() => {
    setEscolhas({});
  }, []);

  const handleSalvar = useCallback(() => {
    const dados = {
      versao: "1.0",
      data: new Date().toISOString(),
      escolhas,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meu-bracket-copa2026-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [escolhas]);

  const handleCarregar = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const dados = JSON.parse(ev.target.result);
        if (dados.escolhas) setEscolhas(dados.escolhas);
      } catch (err) {
        alert("Erro ao carregar bracket: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A" }}>
      <div style={{
        background: "linear-gradient(135deg, #0033A0, #001a66)",
        padding: "14px 16px 12px",
        borderBottom: "2px solid #FFD700",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button onClick={onVoltar} style={{
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
            color: "#F0F4FF", padding: "6px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
            ← Voltar
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#FFD700", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
              BOLÃO DA COPA 2026
            </div>
            <div style={{ color: "#F0F4FF", fontSize: 18, fontWeight: 900 }}>
              🏆 Simulador
            </div>
          </div>
        </div>

        <div style={{ color: "#8B9CC8", fontSize: 11, textAlign: "center", marginBottom: 8 }}>
          Monte seu cenário — clique no vencedor de cada jogo
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={handleReset} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid #1E2A45", borderRadius: 8,
            color: "#8B9CC8", padding: "6px 12px", fontWeight: 600, fontSize: 11, cursor: "pointer",
          }}>
            🔄 Resetar
          </button>
          <button onClick={handleSalvar} style={{
            background: "rgba(34,197,94,0.12)", border: "1px solid #22c55e44", borderRadius: 8,
            color: "#22c55e", padding: "6px 12px", fontWeight: 600, fontSize: 11, cursor: "pointer",
          }}>
            💾 Salvar bracket
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{
            background: "rgba(255,215,0,0.1)", border: "1px solid #FFD70044", borderRadius: 8,
            color: "#FFD700", padding: "6px 12px", fontWeight: 600, fontSize: 11, cursor: "pointer",
          }}>
            📂 Carregar
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleCarregar} />
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8B9CC8", marginBottom: 3 }}>
            <span>Progresso: {progresso.escolhidos}/{progresso.total} jogos</span>
            <span>{Math.round(progresso.escolhidos / progresso.total * 100)}%</span>
          </div>
          <div style={{ background: "#1E2A45", borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{
              background: "linear-gradient(90deg, #0033A0, #22c55e)",
              height: "100%", width: `${progresso.escolhidos / progresso.total * 100}%`,
              borderRadius: 99, transition: "width 0.3s",
            }} />
          </div>
        </div>
      </div>

      <BracketView phases={phases} escolhas={escolhas} onEscolha={handleEscolha} />

      <div style={{
        display: "flex", gap: 12, justifyContent: "center", padding: "12px 16px 40px",
        fontSize: 11, color: "#6b7280", flexWrap: "wrap",
      }}>
        <span>🟢 Sua escolha</span>
        <span>🔒 Resultado real</span>
        <span>⏳ Aguardando</span>
      </div>
    </div>
  );
}
