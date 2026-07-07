-- =============================================================
-- BOLÃO COPA 2026 — Habilitar RLS em TODAS as tabelas públicas
-- Execute este script no SQL Editor do Supabase Dashboard
-- =============================================================

-- HABILITAR RLS (re-executa como garantia)
ALTER TABLE public.jogadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.convites_grupo ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- POLÍTICAS: admin (resultados — leitura pública)
-- =============================================================
DROP POLICY IF EXISTS "admin_select_public" ON public.admin;
DROP POLICY IF EXISTS "admin_insert_admin" ON public.admin;
DROP POLICY IF EXISTS "admin_update_admin" ON public.admin;
DROP POLICY IF EXISTS "anon_all_admin" ON public.admin;

CREATE POLICY "admin_select_public" ON public.admin
  FOR SELECT USING (true);

CREATE POLICY "admin_insert_admin" ON public.admin
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

CREATE POLICY "admin_update_admin" ON public.admin
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =============================================================
-- POLÍTICAS: cartelas
-- =============================================================
DROP POLICY IF EXISTS "cartelas_select_own" ON public.cartelas;
DROP POLICY IF EXISTS "cartelas_insert_own" ON public.cartelas;
DROP POLICY IF EXISTS "cartelas_update_own" ON public.cartelas;
DROP POLICY IF EXISTS "cartelas_delete_own" ON public.cartelas;
DROP POLICY IF EXISTS "cartelas_select_admin" ON public.cartelas;
DROP POLICY IF EXISTS "cartelas_update_admin" ON public.cartelas;
DROP POLICY IF EXISTS "anon_all_cartelas" ON public.cartelas;
DROP POLICY IF EXISTS "cartelas_select_public_ia" ON public.cartelas;

-- Leitura pública para exibição de cartelas (inclusive IAs)
CREATE POLICY "cartelas_select_public" ON public.cartelas
  FOR SELECT USING (true);

-- Usuário autenticado pode criar sua própria cartela
CREATE POLICY "cartelas_insert_own" ON public.cartelas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar suas próprias cartelas
CREATE POLICY "cartelas_update_own" ON public.cartelas
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuário pode excluir suas próprias cartelas
CREATE POLICY "cartelas_delete_own" ON public.cartelas
  FOR DELETE USING (auth.uid() = user_id);

-- Admin pode atualizar qualquer cartela
CREATE POLICY "cartelas_update_admin" ON public.cartelas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =============================================================
-- POLÍTICAS: config (leitura pública)
-- =============================================================
DROP POLICY IF EXISTS "config_select_public" ON public.config;
DROP POLICY IF EXISTS "config_insert_admin" ON public.config;
DROP POLICY IF EXISTS "config_update_admin" ON public.config;
DROP POLICY IF EXISTS "anon_all_config" ON public.config;

CREATE POLICY "config_select_public" ON public.config
  FOR SELECT USING (true);

CREATE POLICY "config_insert_admin" ON public.config
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

CREATE POLICY "config_update_admin" ON public.config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =============================================================
-- POLÍTICAS: jogadores
-- =============================================================
DROP POLICY IF EXISTS "jogadores_select_own" ON public.jogadores;
DROP POLICY IF EXISTS "jogadores_insert_own" ON public.jogadores;
DROP POLICY IF EXISTS "jogadores_update_own" ON public.jogadores;
DROP POLICY IF EXISTS "jogadores_select_admin" ON public.jogadores;
DROP POLICY IF EXISTS "anon_all_jogadores" ON public.jogadores;

-- Leitura pública (necessário para ranking)
CREATE POLICY "jogadores_select_public" ON public.jogadores
  FOR SELECT USING (true);

-- Jogador pode inserir seu próprio perfil
CREATE POLICY "jogadores_insert_own" ON public.jogadores
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Jogador pode atualizar seu próprio perfil
CREATE POLICY "jogadores_update_own" ON public.jogadores
  FOR UPDATE USING (auth.uid() = id);

-- =============================================================
-- POLÍTICAS: grupos
-- =============================================================
-- Qualquer um pode listar grupos públicos
CREATE POLICY "grupos_select_public" ON public.grupos
  FOR SELECT USING (true);

-- Usuário autenticado pode criar grupos
CREATE POLICY "grupos_insert_auth" ON public.grupos
  FOR INSERT WITH CHECK (auth.uid() = criador_id);

-- Criador pode atualizar seu grupo
CREATE POLICY "grupos_update_own" ON public.grupos
  FOR UPDATE USING (auth.uid() = criador_id);

-- =============================================================
-- POLÍTICAS: membros_grupo
-- =============================================================
-- Qualquer um pode ver membros (necessário para exibir na tela)
CREATE POLICY "membros_select_public" ON public.membros_grupo
  FOR SELECT USING (true);

-- Usuário pode se adicionar a um grupo
CREATE POLICY "membros_insert_own" ON public.membros_grupo
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Admin do grupo pode atualizar (ex: marcar pago)
CREATE POLICY "membros_update_admin" ON public.membros_grupo
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.membros_grupo mg
     WHERE mg.grupo_id = grupo_id AND mg.usuario_id = auth.uid() AND mg.role = 'admin')
  );

-- =============================================================
-- POLÍTICAS: convites_grupo (contém token sensível)
-- =============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'convites_grupo') THEN
    -- Usuário só vê convites enviados POR ele ou PARA ele
    CREATE POLICY "convites_select_own" ON public.convites_grupo
      FOR SELECT USING (auth.uid() = criador_id OR auth.uid() = convidado_id);

    -- Usuário pode criar convite se for admin do grupo
    CREATE POLICY "convites_insert_admin" ON public.convites_grupo
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.membros_grupo mg
         WHERE mg.grupo_id = grupo_id AND mg.usuario_id = auth.uid() AND mg.role = 'admin')
      );

    -- Criador pode deletar convite
    CREATE POLICY "convites_delete_own" ON public.convites_grupo
      FOR DELETE USING (auth.uid() = criador_id);
  END IF;
END;
$$;
