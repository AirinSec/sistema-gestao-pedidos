// ============================================================
// Cliente Supabase (frontend)
// ============================================================

const SUPABASE_URL =
'https://etqwrbmgnvsdehimmslx.supabase.co';

const SUPABASE_PUBLISHABLE =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cXdyYm1nbnZzZGVoaW1tc2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODI2MjUsImV4cCI6MjA4OTI1ODYyNX0.Z9qUrXoWIq2-iPb1sk--MndV61qart04RT8BhT40fHg';

var supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE
);