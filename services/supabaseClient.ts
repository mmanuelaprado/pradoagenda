
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cldoajaqqbrbjlkfiled.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kHl0rLM52tX3_mghI77BsA_35_eH9Uh";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para gerenciar o ID do usuário atual de forma segura
export const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};
