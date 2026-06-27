import React from "react";
import BracketMatch from "./BracketMatch";

const ROUNDS = [
  { key: "r32", label: "1/16 - 32 AVOS" },
  { key: "oit", label: "OITAVAS" },
  { key: "qua", label: "QUARTAS" },
  { key: "sem", label: "SEMI" },
  { key: "fin", label: "FINAL" },
];

const SPACING = [4, 80, 180, 380, 0];

export default function BracketView({ phases, escolhas, onEscolha }) {
  if (!phases) return null;

  return (
    <div style={{
      overflowX: "auto", overflowY: "hidden",
      padding: "16px 0 40px",
      WebkitOverflowScrolling: "touch",
    }}>
      <div style={{ display: "flex", gap: 14, minWidth: 940, padding: "0 10px" }}>
        {ROUNDS.map((cfg, ri) => {
          const items = phases[cfg.key] || [];
          const spacing = SPACING[ri];
          return (
            <div key={cfg.key} style={{
              display: "flex", flexDirection: "column",
              gap: spacing, minWidth: ri === 4 ? 210 : 180,
            }}>
              <div style={{
                textAlign: "center", fontSize: 10, fontWeight: 800,
                color: "#FFD700", letterSpacing: 1.5, padding: "6px 0",
                borderBottom: "1px solid rgba(255,215,0,0.2)", marginBottom: 2,
              }}>
                {cfg.label}
              </div>
              {items.map((item, i) => (
                <div key={item.match?.id || i}>
                  <BracketMatch
                    match={item.match}
                    jogoInfo={item.jogoInfo}
                    escolha={escolhas?.[item.match?.id]}
                    onEscolha={(lado) => onEscolha?.(item.match?.id, lado)}
                  />
                </div>
              ))}
              {cfg.key === "fin" && items.length > 0 && items[0]?.match?.winner && (
                <div style={{
                  textAlign: "center", marginTop: 8,
                  fontSize: 14, fontWeight: 900, color: "#FFD700",
                  letterSpacing: 2,
                  animation: "pulse 2s infinite",
                }}>
                  🏆 CAMPEÃO
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
