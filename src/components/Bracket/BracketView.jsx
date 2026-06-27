import React from "react";
import BracketMatch from "./BracketMatch";

const ROUND_CONFIG = [
  { key: "r32", label: "1/16 - 32 AVOS",  base: 6,  gapMult: 1 },
  { key: "oit", label: "OITAVAS",          base: 6,  gapMult: 2 },
  { key: "qua", label: "QUARTAS",          base: 6,  gapMult: 4 },
  { key: "sem", label: "SEMI",             base: 6,  gapMult: 6 },
  { key: "fin", label: "FINAL",            base: 6,  gapMult: 8 },
];

export default function BracketView({ phases }) {
  if (!phases) return null;

  return (
    <div style={{
      overflowX: "auto", overflowY: "hidden",
      padding: "16px 0 40px",
      WebkitOverflowScrolling: "touch",
    }}>
      <div style={{ display: "flex", gap: 10, minWidth: 920, padding: "0 10px" }}>
        {ROUND_CONFIG.map((cfg, ri) => {
          const items = phases[cfg.key] || [];
          return (
            <div key={cfg.key} style={{
              display: "flex", flexDirection: "column", gap: cfg.base + ri * cfg.gapMult,
              minWidth: ri === 4 ? 210 : 180,
            }}>
              <div style={{
                textAlign: "center", fontSize: 10, fontWeight: 800, color: "#FFD700",
                letterSpacing: 1.5, padding: "6px 0",
                borderBottom: "1px solid rgba(255,215,0,0.2)", marginBottom: 2,
              }}>
                {cfg.label}
              </div>
              {items.map((item, i) => (
                <div key={item.match?.id || i}>
                  <BracketMatch
                    match={item.match}
                    jogoInfo={item.jogoInfo}
                    palpite={item.palpite}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
