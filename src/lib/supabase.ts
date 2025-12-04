import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: number
          name: string
          capacity: number
          created_at?: string
        }
        Insert: {
          id?: number
          name: string
          capacity: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          capacity?: number
          created_at?: string
        }
      }
      spots: {
        Row: {
          id: number
          code: string
          floor: number
          building_id: number
          is_occupied: boolean
          created_at?: string
        }
        Insert: {
          id?: number
          code: string
          floor: number
          building_id: number
          is_occupied?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          floor?: number
          building_id?: number
          is_occupied?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: number
          name: string
          card_id: string
          user_type: 'car_owner' | 'building_owner'
          created_at?: string
        }
        Insert: {
          id?: number
          name: string
          card_id: string
          user_type: 'car_owner' | 'building_owner'
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          card_id?: string
          user_type?: 'car_owner' | 'building_owner'
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: number
          plate_number: string
          user_id: number
          created_at?: string
        }
        Insert: {
          id?: number
          plate_number: string
          user_id: number
          created_at?: string
        }
        Update: {
          id?: number
          plate_number?: string
          user_id?: number
          created_at?: string
        }
      }
      user_spots: {
        Row: {
          id: number
          spot_id: number
          unique_code: string
          vehicle_id: number
          parked_at: string
          released_at?: string
          created_at?: string
        }
        Insert: {
          id?: number
          spot_id: number
          unique_code: string
          vehicle_id: number
          parked_at?: string
          released_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          spot_id?: number
          unique_code?: string
          vehicle_id?: number
          parked_at?: string
          released_at?: string
          created_at?: string
        }
      }
    }
  }
}
