const { createClient } = require('@supabase/supabase-js');
const ws = require('ws'); // <--- 1. Importa o pacote usando require

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

// 2. Passa o objeto de configuração com a opção de transporte como terceiro argumento
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
realtime: {
    transport: ws
}
});

module.exports = { supabase };
