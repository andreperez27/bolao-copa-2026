import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import BracketMatch from "./BracketMatch";

const ROUNDS = [
  { key: "r32", label: "1/16 - 32 AVOS" },
  { key: "oit", label: "OITAVAS" },
  { key: "qua", label: "QUARTAS" },
  { key: "sem", label: "SEMI" },
  { key: "fin", label: "FINAL" },
  { key: "ter", label: "3º LUGAR" },
];

const CARD_GAP = 4;

function groupPairs(items) {
  const pairs = [];
  for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));
  return pairs;
}

export default function BracketView({ phases, escolhas, onEscolha, onEscolhaTerceiro }) {
  const containerRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(170);
  const [cardHeight, setCardHeight] = useState(60);

  const update = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const gaps = 14 * 5 + 20;
    const cw = Math.max(120, Math.min(180, (w - gaps) / 6));

    const headerOffset = 56;
    const avail = window.innerHeight - headerOffset - 40;
    const pairs = 8;
    const ch = Math.max(36, Math.min(70, Math.floor((avail - CARD_GAP * pairs) / (pairs * 2))));

    setCardWidth(cw);
    setCardHeight(ch);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  useEffect(() => { update(); }, [phases, update]);

  const containerHeight = useMemo(() => {
    return 16 * cardHeight + 8 * CARD_GAP;
  }, [cardHeight]);

  if (!phases) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%", overflowX: "auto", overflowY: "auto",
        padding: "16px 0 40px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ display: "flex", gap: 14, padding: "0 10px" }}>
        {ROUNDS.map((cfg, ri) => {
          const items = phases[cfg.key] || [];
          const pairs = groupPairs(items);

          return (
            <div key={cfg.key} style={{
              display: "flex", flexDirection: "column",
              height: containerHeight,
              minWidth: ri === 4 ? cardWidth + 30 : cardWidth,
            }}>
              <div style={{
                textAlign: "center", fontSize: 10, fontWeight: 800,
                color: "#FFD700", letterSpacing: 1.5, padding: "6px 0",
                borderBottom: "1px solid rgba(255,215,0,0.2)", marginBottom: 4,
                flexShrink: 0,
              }}>
                {cfg.label}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {pairs.map((pair, pi) => (
                  <div key={pi} style={{
                    flex: 1,
                    display: "flex", flexDirection: "column",
                    justifyContent: pair.length === 2 ? "space-between" : "center",
                  }}>
                    {pair.map(item => (
                      <div key={item.match?.id || pi + "_" + Math.random()}>
                        <BracketMatch
                          match={item.match}
                          jogoInfo={item.jogoInfo}
                          escolha={escolhas?.[item.match?.id]}
                          onEscolha={(lado) => onEscolha?.(item.match?.id, lado)}
                          cardWidth={cardWidth}
                          onEscolhaTerceiro={onEscolhaTerceiro}
                          terceiroEscolhido={escolhas?.[`terceiro_${item.match?.id}`]}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

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
