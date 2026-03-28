import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export type ExamRow = {
  school_id:     string
  school_name:   string
  kind:          string
  pref:          string
  region:        string
  dept:          string
  exam_type:     string
  exam_round:    string
  url:           string
  app_start:     string | null
  app_end:       string | null
  app_method:    string | null
  ex1_date:      string | null
  ex1_content:   string[]
  ex2_date:      string | null
  ex2_content:   string[]
  result_date:   string | null
  result_method: string | null
  gpa_min:       number
  eiken:         string
  qualification: string | null
  note:          string | null
  auto_status:   string
}