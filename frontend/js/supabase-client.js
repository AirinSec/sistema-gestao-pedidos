// ============================================================
//  Cliente Supabase (frontend)
//  Importar este arquivo antes de qualquer outro script JS
//  que precise do cliente supabase.
//
//  SUPABASE_PUBLISHABLE_KEY é segura para uso no frontend —
//  o acesso ao banco é bloqueado pelo RLS para a chave pública.
//  Toda operação sensível passa pelo backend via SUPABASE_SECRET_KEY.
// ============================================================

const SUPABASE_URL         = 'https://your-supabase-url.supabase.co'; // Substitua pela sua URL real
const SUPABASE_PUBLISHABLE = 'sb_publishable_xxxxxxxxxxxxxxxx_xxx_xxxx'; // Substitua pela sua chave pública real

// Criar cliente Supabase para uso no frontend
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE);
