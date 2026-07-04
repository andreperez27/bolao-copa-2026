import { useState, useEffect, useCallback, useRef } from "react";
import { getAdminData, getConfig, salvarAdminData } from "../services/admin";
import { parseResultadosDeAPI, fetchResultadosDeURL, API_URLS, API_URL_PADRAO } from "../utils/parseResultadosAPI";

export function useRanking() {
  const [resultados, setResultados] = useState({});
  const [campeoReal, setCampeoReal] = useState("");
  const [viceCampeaoReal, setViceCampeaoReal] = useState("");
  const [artilheiroRealNome, setArtilheiroRealNome] = useState("");
  const [artilheiroRealSelecao, setArtilheiroRealSelecao] = useState("");
  const [config, setConfigLocal] = useState({ valor_aposta: 20, api_url: "" });
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const loadData = useCallback(async () => {
    const admin = await getAdminData();
    setResultados(admin.resultados);
    setCampeoReal(admin.campeoReal);
    setViceCampeaoReal(admin.viceCampeaoReal || "");
    setArtilheiroRealNome(admin.artilheiroRealNome || "");
    setArtilheiroRealSelecao(admin.artilheiroRealSelecao || "");
    const cfg = await getConfig();
    setConfigLocal(cfg);
  }, []);

  const resultadosRef = useRef({});
  const campeoRef = useRef("");
  const viceRef = useRef("");
  const artNomeRef = useRef("");
  const artSelRef = useRef("");
  useEffect(() => { resultadosRef.current = resultados; }, [resultados]);
  useEffect(() => { campeoRef.current = campeoReal; }, [campeoReal]);
  useEffect(() => { viceRef.current = viceCampeaoReal; }, [viceCampeaoReal]);
  useEffect(() => { artNomeRef.current = artilheiroRealNome; }, [artilheiroRealNome]);
  useEffect(() => { artSelRef.current = artilheiroRealSelecao; }, [artilheiroRealSelecao]);

  const autoFetchResultados = useCallback(async (url) => {
    try {
      const data = await fetchResultadosDeURL(url);
      const novos = parseResultadosDeAPI(data);
      const count = Object.keys(novos).length;
      if (count > 0) {
        const mergeados = {};
        const chaves = new Set([...Object.keys(resultadosRef.current), ...Object.keys(novos)]);
        for (const id of chaves) {
          const velho = resultadosRef.current[id] || {};
          const novo = novos[id] || {};
          mergeados[id] = { ...velho };
          if (novo.placar_a !== undefined) mergeados[id].placar_a = novo.placar_a;
          if (novo.placar_b !== undefined) mergeados[id].placar_b = novo.placar_b;
          if (novo.pro_a !== undefined) mergeados[id].pro_a = novo.pro_a;
          if (novo.pro_b !== undefined) mergeados[id].pro_b = novo.pro_b;
          if (novo.pen_a !== undefined && velho.pen_a === undefined && velho.pen_b === undefined) mergeados[id].pen_a = novo.pen_a;
          if (novo.pen_b !== undefined && velho.pen_a === undefined && velho.pen_b === undefined) mergeados[id].pen_b = novo.pen_b;
        }
        setResultados(mergeados);
        salvarAdminData(mergeados, campeoRef.current, viceRef.current, artNomeRef.current, artSelRef.current).catch(() => {});
        setUltimaAtualizacao(new Date());
      }
    } catch {}
  }, []);

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

  useEffect(() => {
    const url = config.api_url || API_URL_PADRAO;
    const id = setInterval(() => autoFetchResultados(url), 120000);
    return () => clearInterval(id);
  }, [config.api_url, autoFetchResultados]);

  const updateResultados = useCallback((novos, novoCampeo, novoVice, novoArtNome, novoArtSel) => {
    setResultados(novos);
    setCampeoReal(novoCampeo);
    if (novoVice !== undefined) setViceCampeaoReal(novoVice);
    if (novoArtNome !== undefined) setArtilheiroRealNome(novoArtNome);
    if (novoArtSel !== undefined) setArtilheiroRealSelecao(novoArtSel);
  }, []);

  return { resultados, campeoReal, viceCampeaoReal, artilheiroRealNome, artilheiroRealSelecao, config, updateResultados, loadData, ultimaAtualizacao };
}
