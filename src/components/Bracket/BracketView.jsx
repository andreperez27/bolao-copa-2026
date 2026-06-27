import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import BracketMatch from "./BracketMatch";

const ROUNDS = [
  { key: "r32", label: "1/16 - 32 AVOS" },
  { key: "oit", label: "OITAVAS" },
  { key: "qua", label: "QUARTAS" },
  { key: "sem", label: "SEMI" },
  { key: "fin", label: "FINAL" },
];

export default function BracketView({ phases, escolhas, onEscolha }) {
  const containerRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(170);

  const update = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const gaps = 14 * 4 + 20;
    const cw = Math.max(120, Math.min(180, (w - gaps) / 5));
    setCardWidth(cw);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  useEffect(() => { update(); }, [phases, update]);

  const spacing = useMemo(() => {
    const factor = cardWidth / 180;
    return [4, Math.round(80 * factor), Math.round(180 * factor), Math.round(380 * factor), 0];
  }, [cardWidth]);

  if (!phases) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%", overflowX: "auto", overflowY: "hidden",
        padding: "16px 0 40px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ display: "flex", gap: 14, padding: "0 10px" }}>
        {ROUNDS.map((cfg, ri) => {
          const items = phases[cfg.key] || [];
          return (
            <div key={cfg.key} style={{
              display: "flex", flexDirection: "column",
              gap: spacing[ri], minWidth: ri === 4 ? cardWidth + 30 : cardWidth,
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
                    cardWidth={cardWidth}
                  />
                </div>
              ))}
              {cfg.key === "fin" && items.length > 0 && items[0]?.match?.winner && (
                <div style={{
                  textAlign: "center", marginTop: 8,
                  fontSize: 14, fontWeight: 900, color: "#FFD700",
                  letterSpacing: 2, animation: "pulse 2s infinite",
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
