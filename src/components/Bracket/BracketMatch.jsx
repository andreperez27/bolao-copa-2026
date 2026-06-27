import React from "react";
import { ISO } from "../../services/jogos";

function Flag({ time, size = 14 }) {
  const code = ISO[time];
  if (!code) return <span style={{ fontSize: size * 0.7, lineHeight: 1, opacity: 0.5 }}>?</span>;
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

function getStatus(match, palpite) {
  if (!match.result) return "pending";
  const vencedor = match.winner;
  if (!palpite) return "no_palpite";
  const pa = Number(palpite.gols_a);
  const pb = Number(palpite.gols_b);
  if (pa == null || pb == null || (isNaN(pa) && isNaN(pb))) return "no_palpite";
  const palpiteVencedor = pa > pb ? match.team1 : pb > pa ? match.team2 : null;
  if (!palpiteVencedor) return "no_palpite";
  return palpiteVencedor === vencedor ? "acertou" : "errou";
}

export default function BracketMatch({ match, jogoInfo, palpite }) {
  if (!match) return null;
  const status = getStatus(match, palpite);
  const isPlaceholder = (name) => name && (name.startsWith("2º") || name.startsWith("1º") || name.startsWith("3º") || name.startsWith("V ") || name.startsWith("Vencedor"));

  const borderColor =
    status === "acertou" ? "#22c55e" :
    status === "errou" ? "#ef4444" :
    status === "no_palpite" && match.result ? "#6b7280" :
    "#1E2A45";

  return (
    <div style={{
      background: "#111827",
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      padding: "8px 10px",
      minWidth: 170,
      boxShadow: status === "acertou" ? "0 0 8px rgba(34,197,94,0.2)" : "none",
      opacity: match.result ? 1 : 0.85,
    }}>
      <div style={{ fontSize: 8, color: "#6b7280", marginBottom: 4, letterSpacing: 0.3 }}>
        {jogoInfo?.horario_brasilia || ""}
        {jogoInfo?.estadio ? ` · ${jogoInfo.estadio}` : ""}
      </div>

      {[match.team1, match.team2].map((time, i) => {
        const isWinner = match.result && match.winner === time;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "3px 0",
            borderBottom: i === 0 ? "1px solid rgba(30,42,69,0.4)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1 }}>
              {time && !isPlaceholder(time) ? (
                <Flag time={time} size={12} />
              ) : (
                <span style={{ width: 16, height: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, opacity: 0.3 }}>?</span>
              )}
              <span style={{
                fontSize: 11, fontWeight: isWinner ? 700 : 500,
                color: isWinner ? "#22c55e" : isPlaceholder(time) ? "#4B5563" : "#F0F4FF",
                fontStyle: isPlaceholder(time) ? "italic" : "normal",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {time || "A definir"}
              </span>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: "monospace",
              color: isWinner ? "#22c55e" : match.result ? "#F0F4FF" : "#4B5563",
              minWidth: 16, textAlign: "right",
            }}>
              {match.result ? (i === 0 ? match.result.ga : match.result.gb) : "-"}
            </span>
          </div>
        );
      })}

      {status !== "pending" && palpite && (
        <div style={{
          fontSize: 9, marginTop: 4, paddingTop: 4,
          borderTop: "1px solid rgba(30,42,69,0.3)",
          color: status === "acertou" ? "#22c55e" : status === "errou" ? "#ef4444" : "#8B9CC8",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span>Seu palpite: {palpite.gols_a}×{palpite.gols_b}</span>
          <span>{status === "acertou" ? "✅" : status === "errou" ? "❌" : ""}</span>
        </div>
      )}
    </div>
  );
}
