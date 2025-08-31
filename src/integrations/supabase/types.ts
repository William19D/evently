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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      additional_services: {
        Row: {
          cost: number
          description: string | null
          id_service: number
          service_name: string
          space_id: number
        }
        Insert: {
          cost: number
          description?: string | null
          id_service?: number
          service_name: string
          space_id: number
        }
        Update: {
          cost?: number
          description?: string | null
          id_service?: number
          service_name?: string
          space_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_space_service"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id_space"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id_payment: number
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          reservation_id: number
        }
        Insert: {
          amount: number
          id_payment?: number
          payment_date?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reservation_id: number
        }
        Update: {
          amount?: number
          id_payment?: number
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reservation_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservation"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id_reservation"]
          },
        ]
      }
      reservation_services: {
        Row: {
          id_reservation_service: number
          quantity: number
          reservation_id: number
          service_id: number
          total_cost: number
        }
        Insert: {
          id_reservation_service?: number
          quantity?: number
          reservation_id: number
          service_id: number
          total_cost: number
        }
        Update: {
          id_reservation_service?: number
          quantity?: number
          reservation_id?: number
          service_id?: number
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservation_service"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id_reservation"]
          },
          {
            foreignKeyName: "fk_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "additional_services"
            referencedColumns: ["id_service"]
          },
        ]
      }
      reservations: {
        Row: {
          end_date: string
          estimated_capacity: number | null
          id_reservation: number
          reservation_date: string | null
          space_id: number
          start_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          user_id: string
        }
        Insert: {
          end_date: string
          estimated_capacity?: number | null
          id_reservation?: number
          reservation_date?: string | null
          space_id: number
          start_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          user_id: string
        }
        Update: {
          end_date?: string
          estimated_capacity?: number | null
          id_reservation?: number
          reservation_date?: string | null
          space_id?: number
          start_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_space"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id_space"]
          },
        ]
      }
      space_photos: {
        Row: {
          id: number
          photo_url: string
          space_id: number
        }
        Insert: {
          id?: number
          photo_url: string
          space_id: number
        }
        Update: {
          id?: number
          photo_url?: string
          space_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_space_photo"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id_space"]
          },
        ]
      }
      spaces: {
        Row: {
          description: string | null
          id_space: number
          location: string | null
          max_capacity: number
          space_name: string
          status: Database["public"]["Enums"]["space_status"]
        }
        Insert: {
          description?: string | null
          id_space?: number
          location?: string | null
          max_capacity: number
          space_name: string
          status?: Database["public"]["Enums"]["space_status"]
        }
        Update: {
          description?: string | null
          id_space?: number
          location?: string | null
          max_capacity?: number
          space_name?: string
          status?: Database["public"]["Enums"]["space_status"]
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          id: number
          permission: string
        }
        Insert: {
          id?: number
          permission: string
        }
        Update: {
          id?: number
          permission?: string
        }
        Relationships: []
      }
      users_roles: {
        Row: {
          id_rol: number
          rol: Database["public"]["Enums"]["rol"]
        }
        Insert: {
          id_rol?: number
          rol: Database["public"]["Enums"]["rol"]
        }
        Update: {
          id_rol?: number
          rol?: Database["public"]["Enums"]["rol"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_method: "card" | "transfer"
      payment_status: "successful" | "failed" | "pending"
      reservation_status:
        | "pending"
        | "approved"
        | "rejected"
        | "confirmed"
        | "canceled"
        | "modified"
      rol: "owner" | "usuario" | "superAdmin"
      space_status: "active" | "inactive"
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
      payment_method: ["card", "transfer"],
      payment_status: ["successful", "failed", "pending"],
      reservation_status: [
        "pending",
        "approved",
        "rejected",
        "confirmed",
        "canceled",
        "modified",
      ],
      rol: ["owner", "usuario", "superAdmin"],
      space_status: ["active", "inactive"],
    },
  },
} as const
