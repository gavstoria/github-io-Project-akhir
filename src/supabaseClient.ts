import { createClient } from "@supabase/supabase-js";

// URL Proyek Supabase
const supabaseUrl = "https://ckfacmggijsjvrfkjudv.supabase.co";

// API Key dari Supabase
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZmFjbWdnaWpzanZyZmtqdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyOTE5NTgsImV4cCI6MjA1MDg2Nzk1OH0.LGtG_bl2-kJJKBIYT0T1PIi46Mh8qjXOPSGwc9sKtpI";

// Membuat instance Supabase Client
export const supabase = createClient(supabaseUrl, supabaseKey);
