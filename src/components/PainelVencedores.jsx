import React from "react";
import { formatarMoeda } from "../utils/datas";

const P1_PCT = 0.50;
const P2_PCT = 0.30;
const P3_PCT = 0.20;

function getResultadoFinal(resultados) {
  const fin = resultados?.["fin-1"];
  if (!fin) return null;
  const ga = Number(fin.placar_a), gb = Number(fin.placar_b);
  const pro = fin.pro_a != null || fin.pro_b != null;
  const pen = fin.pen_a != null || fin.pen_b != null;
  let sufixo = "";
  if (pen) sufixo = " (pênaltis)";
  else if (pro) sufixo = " (prorrogação)";
  return { ga, gb, sufixo, descricao: `${ga} × ${gb}${sufixo}` };
}

export function PainelVencedores({ primeiro, segundo, terceiro, totalParticipantes, valorAposta, campeoReal, viceCampeaoReal, resultados }) {
  const acumulado = (totalParticipantes || 0) * (valorAposta || 20);
  const premio1 = acumulado * P1_PCT;
  const premio2 = acumulado * P2_PCT;
  const premio3 = acumulado * P3_PCT;
  const finalInfo = getResultadoFinal(resultados);

  const handleCompartilhar = async () => {
    let texto = "\u{1F3C6} Bolão Copa 2026 — ENCERRADO!\n\n";
    if (primeiro) texto += "\u{1F947} 1\u00BA: " + primeiro.participante + " — " + primeiro.pts + " pts — " + formatarMoeda(premio1) + "\n";
    if (segundo) texto += "\u{1F948} 2\u00BA: " + segundo.participante + " — " + segundo.pts + " pts — " + formatarMoeda(premio2) + "\n";
    if (terceiro) texto += "\u{1F949} 3\u00BA: " + terceiro.participante + " — " + terceiro.pts + " pts — " + formatarMoeda(premio3) + "\n";
    if (campeoReal) texto += "\nCampeão real: " + campeoReal;
    if (finalInfo) texto += " (Final: " + finalInfo.descricao + ")";
    texto += "\n\nFeito por @andreperez27";

    if (navigator.share) {
      try {
        await navigator.share({ title: "Bolão Copa 2026", text: texto });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(texto);
      alert("Texto copiado para compartilhar no WhatsApp!");
    } catch {
      prompt("Copie o texto abaixo:", texto);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0A0E1A, #1a1a2e)",
        border: "2px solid #FFD700",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 4,
          background: "linear-gradient(90deg, #FFD700, #B8860B, #FFD700)",
        }}
      />

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>{String.fromCodePoint(0x1F3C6)}</div>
        <div style={{ color: "#FFD700", fontSize: 20, fontWeight: 900, letterSpacing: 0.5 }}>
          {"\uD83C\uDFC6"} Bolão encerrado!
        </div>
        <div style={{ color: "#8B9CC8", fontSize: 13, marginTop: 2 }}>
          Confira os vencedores {String.fromCodePoint(0x1F389)}
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 12,
        padding: "0 0 8px",
      }}>
        {segundo ? (
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 28 }}>{String.fromCodePoint(0x1F948)}</div>
            <div style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 800, marginTop: 4 }}>
              {segundo.participante}
            </div>
            <div style={{ color: "#FFD700", fontSize: 16, fontWeight: 900 }}>
              {segundo.pts} pts
            </div>
            <div style={{ color: "#C0C0C0", fontSize: 13, fontWeight: 700, marginTop: 2 }}>
              {formatarMoeda(premio2)}
            </div>
          </div>
        ) : <div style={{ flex: 1 }} />}
        {primeiro ? (
          <div style={{ textAlign: "center", flex: 1.3 }}>
            <div style={{ fontSize: 36 }}>{String.fromCodePoint(0x1F947)}</div>
            <div style={{ color: "#F0F4FF", fontSize: 15, fontWeight: 800, marginTop: 4 }}>
              {primeiro.participante}
            </div>
            <div style={{ color: "#FFD700", fontSize: 22, fontWeight: 900 }}>
              {primeiro.pts} pts
            </div>
            <div style={{ color: "#FFD700", fontSize: 16, fontWeight: 900, marginTop: 2 }}>
              {formatarMoeda(premio1)}
            </div>
          </div>
        ) : <div style={{ flex: 1.3 }} />}
        {terceiro ? (
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 28 }}>{String.fromCodePoint(0x1F949)}</div>
            <div style={{ color: "#F0F4FF", fontSize: 13, fontWeight: 800, marginTop: 4 }}>
              {terceiro.participante}
            </div>
            <div style={{ color: "#FFD700", fontSize: 16, fontWeight: 900 }}>
              {terceiro.pts} pts
            </div>
            <div style={{ color: "#f97316", fontSize: 13, fontWeight: 700, marginTop: 2 }}>
              {formatarMoeda(premio3)}
            </div>
          </div>
        ) : <div style={{ flex: 1 }} />}
      </div>

      <div style={{
        borderTop: "1px solid #1E2A45",
        paddingTop: 14,
        marginTop: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div>
          <div style={{ color: "#8B9CC8", fontSize: 12, marginBottom: 2 }}>
            Campeão real
          </div>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 16 }}>
            {campeoReal || "\u2014"}
            {finalInfo && (
              <span style={{ color: "#8B9CC8", fontWeight: 400, fontSize: 14, marginLeft: 8 }}>
                {finalInfo.descricao}
                {viceCampeaoReal && " (" + viceCampeaoReal + " vice)"}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#8B9CC8", fontSize: 11 }}>
            {totalParticipantes} participantes
          </div>
          <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>
            {formatarMoeda(acumulado)}
          </div>
        </div>
      </div>

      <div style={{
        borderTop: "1px solid #1E2A45",
        paddingTop: 12,
        marginTop: 10,
        display: "flex",
        justifyContent: "center",
        gap: 8,
      }}>
        <div style={{ color: "#8B9CC8", fontSize: 11 }}>
          {P1_PCT*100}% — {P2_PCT*100}% — {P3_PCT*100}%
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button
          onClick={handleCompartilhar}
          style={{
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            border: "none",
            borderRadius: 25,
            padding: "10px 28px",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {String.fromCodePoint(0x1F4F1)} Compartilhar no WhatsApp
        </button>
      </div>
    </div>
  );
}
