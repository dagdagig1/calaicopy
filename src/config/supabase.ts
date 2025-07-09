import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          weight: number | null;
          height: number | null;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          goal: 'lose' | 'maintain' | 'gain' | null;
          daily_calorie_target: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          weight?: number | null;
          height?: number | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          goal?: 'lose' | 'maintain' | 'gain' | null;
          daily_calorie_target?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          weight?: number | null;
          height?: number | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          goal?: 'lose' | 'maintain' | 'gain' | null;
          daily_calorie_target?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
          food_name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber: number | null;
          sugar: number | null;
          sodium: number | null;
          serving_size: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          image_url: string | null;
          confidence_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber?: number | null;
          sugar?: number | null;
          sodium?: number | null;
          serving_size: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          image_url?: string | null;
          confidence_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          fiber?: number | null;
          sugar?: number | null;
          sodium?: number | null;
          serving_size?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          image_url?: string | null;
          confidence_score?: number | null;
          created_at?: string;
        };
      };
    };
  };
};