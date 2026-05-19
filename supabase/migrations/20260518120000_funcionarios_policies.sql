-- Permite que o app (chave anon) leia e gerencie funcionários.
-- Execute no SQL Editor do Supabase se a lista do painel vier vazia.

ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funcionarios_select_anon" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert_anon" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete_anon" ON public.funcionarios;

CREATE POLICY "funcionarios_select_anon"
  ON public.funcionarios
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "funcionarios_insert_anon"
  ON public.funcionarios
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "funcionarios_delete_anon"
  ON public.funcionarios
  FOR DELETE
  TO anon, authenticated
  USING (true);
