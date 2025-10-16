// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dolgzyqsdphlabnpwdku.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbGd6eXFzZHBobGFibnB3ZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzczMjAsImV4cCI6MjA3NTcxMzMyMH0.rW7kmsWef-2Cw1orUdrmFBcAd4Bu9bgJTx77Al1_VME'

export const supabase = createClient(supabaseUrl, supabaseKey)
