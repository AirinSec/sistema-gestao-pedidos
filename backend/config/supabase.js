//importa cliente
const { createClient } = require('@supabase/supabase-js');

//variaveis de ambiente
const supabaseUrl =  process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

//Criação do cliente
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;