import React from "react";
import { ISO } from "../../services/jogos";

function Flag({ time, size = 14 }) {
  const code = ISO[time];
  if (!code) return <span style={{ fontSize: size * 0.7, lineHeight: 1, opacity: 0.4 }}>?</span>;
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={time}
      width={Math.round(size * 1.3)}
      height={size}
      style={{ objectFit: "cover", borderRadius: 2, flexShrink: 0, display: "block" }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

function isPlaceholder(name) {
  if (!name) return true;
  return /^(\d+º|3º x|3º a definir|V\s|Vencedor|A definir)/.test(name);
}

export default function BracketMatch({ match, jogoInfo, escolha, onEscolha, cardWidth = 170 }) {
  if (!match) return null;

  const fScale = cardWidth / 180;
  const fontSize = (n) => n * fScale;
  const pad = (n) => Math.round(n * fScale);

  const { team1, team2, result, travado, winner } = match;
  const semTime1 = !team1 || isPlaceholder(team1);
  const semTime2 = !team2 || isPlaceholder(team2);
  const slotVazio = semTime1 && semTime2;
  const temResultado = !!result;
  const podeClicar = !travado && !slotVazio;
  const winnerName = winner;

  function handleClick(lado) {
    if (!podeClicar) return;
    if (escolha === lado) onEscolha(null);
    else onEscolha(lado);
  }

  const cardBorder =
    travado ? "#FFD700" :
    escolha ? "#22c55e" :
    "#1E2A45";

  return (
    <div style={{
      background: "#111827",
      border: `1px solid ${cardBorder}`,
      borderRadius: 10,
      padding: `${pad(8)}px ${pad(10)}px`,
      minWidth: cardWidth - 8,
      opacity: slotVazio && !travado ? 0.5 : 1,
      boxShadow: escolha ? "0 0 8px rgba(34,197,94,0.15)" : travado ? "0 0 6px rgba(255,215,0,0.1)" : "none",
      transition: "border-color 0.15s, box-shadow 0.15s, opacity 0.15s",
    }}>
      {jogoInfo && (
        <div style={{
          fontSize: fontSize(8), color: "#6b7280",
          marginBottom: pad(4), letterSpacing: 0.3,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {jogoInfo.horario_brasilia || ""}
          {jogoInfo.estadio ? ` · ${jogoInfo.estadio}` : ""}
        </div>
      )}

      {[team1, team2].map((time, i) => {
        const lado = i === 0 ? "time_a" : "time_b";
        const isWinner = winnerName && winnerName === time;
        const isSelected = escolha === lado;
        const isDisabled = !time || isPlaceholder(time);
        const flagSize = Math.round(12 * fScale);

        return (
          <div
            key={i}
            onClick={() => handleClick(lado)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: `${pad(5)}px ${pad(6)}px`, margin: `0 -${pad(6)}px`, borderRadius: 6,
              borderBottom: i === 0 ? "1px solid rgba(30,42,69,0.4)" : "none",
              cursor: podeClicar && !isDisabled ? "pointer" : "default",
              background: isSelected ? "rgba(34,197,94,0.12)" : isWinner && travado ? "rgba(255,215,0,0.08)" : "transparent",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => {
              if (podeClicar && !isDisabled && !isSelected)
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: Math.round(5 * fScale), minWidth: 0, flex: 1 }}>
              {time && !isPlaceholder(time) ? (
                <Flag time={time} size={flagSize} />
              ) : (
                <span style={{
                  width: Math.round(16 * fScale), height: Math.round(12 * fScale),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: fontSize(8), opacity: 0.4, flexShrink: 0,
                }}>
                  {slotVazio ? "⏳" : "?"}
                </span>
              )}
              <span style={{
                fontSize: fontSize(11), fontWeight: isWinner || isSelected ? 700 : 500,
                color: isSelected ? "#22c55e" : isWinner && travado ? "#FFD700" : isPlaceholder(time) ? "#4B5563" : "#F0F4FF",
                fontStyle: isPlaceholder(time) ? "italic" : "normal",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {time || (slotVazio ? "Aguardando..." : "A definir")}
              </span>
              {isSelected && <span style={{ fontSize: fontSize(9), color: "#22c55e", flexShrink: 0 }}>✓</span>}
              {travado && isWinner && <span style={{ fontSize: fontSize(9), color: "#FFD700", flexShrink: 0 }}>🔒</span>}
            </div>
            {travado && temResultado ? (
              <span style={{
                fontSize: fontSize(13), fontWeight: 700, fontFamily: "monospace",
                color: isWinner ? "#FFD700" : "#6b7280",
                minWidth: Math.round(16 * fScale), textAlign: "right", flexShrink: 0,
              }}>
                {i === 0 ? result.ga : result.gb}
              </span>
            ) : (
              <span style={{
                fontSize: fontSize(11), fontWeight: 600,
                color: isSelected ? "#22c55e" : "#4B5563",
                minWidth: Math.round(16 * fScale), textAlign: "right", flexShrink: 0,
              }}>
                {isSelected || (travado && isWinner) ? "●" : "-"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
