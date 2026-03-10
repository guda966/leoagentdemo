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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          id: string
          job_id: string
          match_score: number | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          id?: string
          job_id: string
          match_score?: number | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          id?: string
          job_id?: string
          match_score?: number | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          description: string | null
          experience: string | null
          id: string
          location: string | null
          recruiter_id: string
          salary_range: string | null
          skills_required: string[] | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          experience?: string | null
          id?: string
          location?: string | null
          recruiter_id: string
          salary_range?: string | null
          skills_required?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          experience?: string | null
          id?: string
          location?: string | null
          recruiter_id?: string
          salary_range?: string | null
          skills_required?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mock_interviews: {
        Row: {
          answers: Json | null
          created_at: string
          feedback: Json | null
          id: string
          questions: Json | null
          role_type: string
          score: number | null
          student_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          feedback?: Json | null
          id?: string
          questions?: Json | null
          role_type: string
          score?: number | null
          student_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          feedback?: Json | null
          id?: string
          questions?: Json | null
          role_type?: string
          score?: number | null
          student_id?: string
        }
        Relationships: []
      }
      placement_drives: {
        Row: {
          applied_count: number | null
          college_admin_id: string
          company: string
          created_at: string
          drive_date: string | null
          eligible_count: number | null
          id: string
          roles: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applied_count?: number | null
          college_admin_id: string
          company: string
          created_at?: string
          drive_date?: string | null
          eligible_count?: number | null
          id?: string
          roles?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applied_count?: number | null
          college_admin_id?: string
          company?: string
          created_at?: string
          drive_date?: string | null
          eligible_count?: number | null
          id?: string
          roles?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          college_id: string | null
          college_name: string | null
          created_at: string
          department: string | null
          education: Json | null
          email: string | null
          experience: Json | null
          full_name: string | null
          graduation_year: number | null
          id: string
          linkedin_url: string | null
          phone: string | null
          placement_readiness_score: number | null
          profile_completion: number | null
          projects: Json | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          college_id?: string | null
          college_name?: string | null
          created_at?: string
          department?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          placement_readiness_score?: number | null
          profile_completion?: number | null
          projects?: Json | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          college_id?: string | null
          college_name?: string | null
          created_at?: string
          department?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          placement_readiness_score?: number | null
          profile_completion?: number | null
          projects?: Json | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "college" | "recruiter" | "owner"
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
    Enums: {
      app_role: ["student", "college", "recruiter", "owner"],
    },
  },
} as const
