import { useState, useEffect, useCallback } from "react";
import { getAdminData, getConfig } from "../services/admin";

export function useRanking() {
  const [resultados, setResultados] = useState({});
  const [campeoReal, setCampeoReal] = useState("");
  const [viceCampeaoReal, setViceCampeaoReal] = useState("");
  const [artilheiroRealNome, setArtilheiroRealNome] = useState("");
  const [artilheiroRealSelecao, setArtilheiroRealSelecao] = useState("");
  const [config, setConfigLocal] = useState({ valor_aposta: 20, bonus_geral: 0 });

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const admin = await getAdminData();
      if (!ativo) return;
      setResultados(admin.resultados);
      setCampeoReal(admin.campeoReal);
      setViceCampeaoReal(admin.viceCampeaoReal || "");
      setArtilheiroRealNome(admin.artilheiroRealNome || "");
      setArtilheiroRealSelecao(admin.artilheiroRealSelecao || "");
      const cfg = await getConfig();
      if (ativo) setConfigLocal(cfg);
    }

    carregar();
    const id = setInterval(carregar, 30000);
    return () => { ativo = false; clearInterval(id); };
  }, []);

  const updateResultados = useCallback((novos, novoCampeo, novoVice, novoArtNome, novoArtSel) => {
    setResultados(novos);
    setCampeoReal(novoCampeo);
    if (novoVice !== undefined) setViceCampeaoReal(novoVice);
    if (novoArtNome !== undefined) setArtilheiroRealNome(novoArtNome);
    if (novoArtSel !== undefined) setArtilheiroRealSelecao(novoArtSel);
  }, []);

  return { resultados, campeoReal, viceCampeaoReal, artilheiroRealNome, artilheiroRealSelecao, config, updateResultados };
}
