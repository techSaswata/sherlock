import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uuocunrkthcixhkgzxeq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1b2N1bnJrdGhjaXhoa2d6eGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzQ5NTcsImV4cCI6MjA3NzIxMDk1N30.ifQQaS0v_VcEN9g-6xRmA2s0w48x3iRyTdAYCStwaI4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface VideoAnalysis {
  id: string
  url: string
  url_status: string | null
  url_content: any | null
  inserted_at: string
}

