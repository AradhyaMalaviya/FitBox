export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assigned_trainers: {
        Row: {
          assignment_date: string | null
          id: string
          notes: string | null
          status: string | null
          subscription_id: string | null
          trainer_name: string | null
          user_id: string
        }
        Insert: {
          assignment_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          subscription_id?: string | null
          trainer_name?: string | null
          user_id: string
        }
        Update: {
          assignment_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          subscription_id?: string | null
          trainer_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_trainers_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      gymbuddy_matches: {
        Row: {
          id: string
          last_session_logged: string | null
          matched_at: string | null
          shared_streak: number | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          id?: string
          last_session_logged?: string | null
          matched_at?: string | null
          shared_streak?: number | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          id?: string
          last_session_logged?: string | null
          matched_at?: string | null
          shared_streak?: number | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
      }
      gymbuddy_messages: {
        Row: {
          content: string
          id: string
          is_read: boolean | null
          match_id: string | null
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          content: string
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          content?: string
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      gymbuddy_profiles: {
        Row: {
          age_range_max: number
          age_range_min: number
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          experience_level: string
          fitness_goals: string[]
          gender: string | null
          gym_location: string
          id: string
          is_discoverable: boolean | null
          preferred_timings: string[]
          profile_visibility: string | null
          updated_at: string | null
          workout_split: string
        }
        Insert: {
          age_range_max: number
          age_range_min: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          experience_level: string
          fitness_goals: string[]
          gender?: string | null
          gym_location: string
          id: string
          is_discoverable?: boolean | null
          preferred_timings: string[]
          profile_visibility?: string | null
          updated_at?: string | null
          workout_split: string
        }
        Update: {
          age_range_max?: number
          age_range_min?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          experience_level?: string
          fitness_goals?: string[]
          gender?: string | null
          gym_location?: string
          id?: string
          is_discoverable?: boolean | null
          preferred_timings?: string[]
          profile_visibility?: string | null
          updated_at?: string | null
          workout_split?: string
        }
        Relationships: []
      }
      gymbuddy_session_logs: {
        Row: {
          created_at: string | null
          id: string
          logged_by: string | null
          match_id: string | null
          notes: string | null
          session_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logged_by?: string | null
          match_id?: string | null
          notes?: string | null
          session_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logged_by?: string | null
          match_id?: string | null
          notes?: string | null
          session_date?: string
        }
        Relationships: []
      }
      gymbuddy_swipes: {
        Row: {
          created_at: string | null
          direction: string | null
          id: string
          swiper_id: string | null
          target_id: string | null
        }
        Insert: {
          created_at?: string | null
          direction?: string | null
          id?: string
          swiper_id?: string | null
          target_id?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string | null
          id?: string
          swiper_id?: string | null
          target_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_inr: number
          created_at: string
          currency: string | null
          error_message: string | null
          id: string
          order_id: string
          payment_method: string | null
          payment_status: string
          payment_timestamp: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          subscription_id: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          order_id: string
          payment_method?: string | null
          payment_status?: string
          payment_timestamp?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          order_id?: string
          payment_method?: string | null
          payment_status?: string
          payment_timestamp?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          phone_number: string | null
          preferences: Json | null
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          preferences?: Json | null
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          preferences?: Json | null
          username?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_inr: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_inr: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_inr?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renewal: boolean | null
          created_at: string
          end_date: string | null
          id: string
          plan_id: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renewal?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renewal?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_sensitive_data: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
          trainer_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          trainer_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_sensitive_data_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "assigned_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string
          exercise_id: string | null
          exercise_name: string
          id: string
          order_index: number
          session_id: string
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          order_index?: number
          session_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          order_index?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          name: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          name: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          name?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sets: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          log_id: string
          reps: number
          set_number: number
          weight: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          log_id: string
          reps?: number
          set_number: number
          weight?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          log_id?: string
          reps?: number
          set_number?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          duration: string | null
          exercise_name: string
          id: string
          muscle_group: string | null
          notes: string | null
          reps: number | null
          sets: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          exercise_name: string
          id?: string
          muscle_group?: string | null
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          exercise_name?: string
          id?: string
          muscle_group?: string | null
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_gymbuddy_candidates: {
        Args: {
          p_limit?: number
        }
        Returns: Database['public']['Tables']['gymbuddy_profiles']['Row'][]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
