import { supabaseFetch, supabaseHeaders, SUPABASE_URL } from "./supabase";

export async function getAdminData() {
  try {
    const res = await supabaseFetch("/rest/v1/admin?select=*&id=eq.1");
    const data = await res.json();
    const resultadosRaw = data?.[0]?.resultados || {};
    const viceCampeaoReal = resultadosRaw?.__vice_campeao_real || data?.[0]?.vice_campeao_real || "";
    const artilheiroRealNome = resultadosRaw?.__artilheiro_real_nome || data?.[0]?.artilheiro_real_nome || "";
    const artilheiroRealSelecao = resultadosRaw?.__artilheiro_real_selecao || data?.[0]?.artilheiro_real_selecao || "";
    const resultados = { ...resultadosRaw };
    delete resultados.__vice_campeao_real;
    delete resultados.__artilheiro_real_nome;
    delete resultados.__artilheiro_real_selecao;
    return {
      resultados,
      campeoReal: data?.[0]?.campeo_real || "",
      viceCampeaoReal,
      artilheiroRealNome,
      artilheiroRealSelecao,
    };
  } catch {
    return { resultados: {}, campeoReal: "", viceCampeaoReal: "", artilheiroRealNome: "", artilheiroRealSelecao: "" };
  }
}

export async function salvarAdminData(resultados, campeoReal, viceCampeaoReal, artilheiroRealNome, artilheiroRealSelecao) {
  const resultadosComMeta = {
    ...(resultados || {}),
  };
  if (viceCampeaoReal) resultadosComMeta.__vice_campeao_real = viceCampeaoReal;
  if (artilheiroRealNome) resultadosComMeta.__artilheiro_real_nome = artilheiroRealNome;
  if (artilheiroRealSelecao) resultadosComMeta.__artilheiro_real_selecao = artilheiroRealSelecao;
  const body = {
    resultados: resultadosComMeta,
    campeo_real: campeoReal,
    updated_at: new Date().toISOString(),
  };
  const res = await supabaseFetch("/rest/v1/admin?id=eq.1", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const res2 = await supabaseFetch("/rest/v1/admin", {
      method: "POST",
      headers: { ...supabaseHeaders, "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ id: 1, ...body }),
    });
    if (!res2.ok && res2.status !== 201) throw new Error("Erro ao salvar dados de admin");
  }
}

export async function getConfig() {
  try {
    const res = await supabaseFetch("/rest/v1/config?select=valor_aposta,admin_password,bonus_geral,bolao_encerrado,campeao_real&id=eq.1");
    const data = await res.json();
    return {
      valor_aposta: data?.[0]?.valor_aposta || 20,
      admin_password: data?.[0]?.admin_password || "",
      bonus_geral: data?.[0]?.bonus_geral || 0,
      bolao_encerrado: data?.[0]?.bolao_encerrado || false,
      campeao_real: data?.[0]?.campeao_real || "",
    };
  } catch {
    return { valor_aposta: 20, bonus_geral: 0, bolao_encerrado: false, campeao_real: "" };
  }
}

export async function salvarConfig({ valor_aposta, admin_password, bonus_geral, bolao_encerrado, campeao_real }) {
  const body = {
    valor_aposta: Number(valor_aposta),
  };
  if (admin_password !== undefined && admin_password !== "") {
    body.admin_password = admin_password;
  }
  if (bonus_geral !== undefined) {
    body.bonus_geral = Number(bonus_geral) || 0;
  }
  if (bolao_encerrado !== undefined) {
    body.bolao_encerrado = bolao_encerrado;
  }
  if (campeao_real !== undefined) {
    body.campeao_real = campeao_real;
  }
  const res = await supabaseFetch("/rest/v1/config?id=eq.1", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const texto = await res.text().catch(() => "");
    const res2 = await supabaseFetch("/rest/v1/config", {
      method: "POST",
      headers: { ...supabaseHeaders, "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ id: 1, ...body }),
    });
    if (!res2.ok && res2.status !== 201) {
      const texto2 = await res2.text().catch(() => "");
      throw new Error("Erro ao salvar configuração\nPATCH: " + res.status + " " + texto.slice(0, 200) + "\nPOST: " + res2.status + " " + texto2.slice(0, 200));
    }
  }
}
