import React, { useRef, useState, useEffect, useCallback } from "react";
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
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!containerRef.current || !innerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const iw = innerRef.current.scrollWidth || 940;
    if (cw > 0 && iw > cw) {
      setScale(cw / iw);
    } else {
      setScale(1);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  useEffect(() => {
    updateScale();
  }, [phases, updateScale]);

  if (!phases) return null;

  const bracketHeight = SPACING.reduce((h, s) => h + s, 0) + 800;

  return (
    <div ref={containerRef} style={{
      width: "100%", overflow: "hidden",
      padding: "16px 0 40px",
    }}>
      <div style={{
        height: bracketHeight * scale + 20,
        position: "relative",
      }}>
        <div
          ref={innerRef}
          style={{
            display: "flex", gap: 14, minWidth: 940, padding: "0 10px",
            transformOrigin: "left top",
            transform: `scale(${scale})`,
          }}
        >
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
    </div>
  );
}
