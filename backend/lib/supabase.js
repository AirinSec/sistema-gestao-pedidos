const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

module.exports = { supabase };