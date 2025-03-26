export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at: string | null
          doctor: string | null
          id: string
          patient_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at?: string | null
          doctor?: string | null
          id?: string
          patient_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          created_at?: string | null
          doctor?: string | null
          id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensing: {
        Row: {
          cost: number | null
          created_at: string
          dispensing_date: string
          dispensing_staff: string
          dosage: string
          duration_of_treatment: string | null
          frequency: string
          id: string
          medication_id: string | null
          medication_name: string
          patient_name: string
          prescriber: string
          quantity: number
          refills: number
        }
        Insert: {
          cost?: number | null
          created_at?: string
          dispensing_date?: string
          dispensing_staff: string
          dosage: string
          duration_of_treatment?: string | null
          frequency: string
          id?: string
          medication_id?: string | null
          medication_name: string
          patient_name: string
          prescriber: string
          quantity: number
          refills?: number
        }
        Update: {
          cost?: number | null
          created_at?: string
          dispensing_date?: string
          dispensing_staff?: string
          dosage?: string
          duration_of_treatment?: string | null
          frequency?: string
          id?: string
          medication_id?: string | null
          medication_name?: string
          patient_name?: string
          prescriber?: string
          quantity?: number
          refills?: number
        }
        Relationships: [
          {
            foreignKeyName: "dispensing_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          expiry_date: string | null
          id: string
          item_code: string
          name: string
          status: string | null
          stock: number
          supplier_name: string
          threshold: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_code: string
          name: string
          status?: string | null
          stock?: number
          supplier_name: string
          threshold?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_code?: string
          name?: string
          status?: string | null
          stock?: number
          supplier_name?: string
          threshold?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          due_date: string
          id: string
          invoice_date: string
          notes: string | null
          paid_amount: number
          patient_id: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          due_date: string
          id?: string
          invoice_date?: string
          notes?: string | null
          paid_amount?: number
          patient_id: string
          status?: string
          total_amount?: number
        }
        Update: {
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          notes?: string | null
          paid_amount?: number
          patient_id?: string
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          patient_id: string
          prescribed_by: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          notes?: string | null
          patient_id: string
          prescribed_by: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          alternate_contact: string | null
          contact_number: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          medical_aid_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          alternate_contact?: string | null
          contact_number: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          medical_aid_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          alternate_contact?: string | null
          contact_number?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          medical_aid_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      practice_information: {
        Row: {
          address_line1: string
          address_line2: string | null
          appointment_reminder_enabled: boolean | null
          business_hours: Json | null
          city: string
          country: string
          created_at: string | null
          created_by: string | null
          currency: string
          email: string
          email_notifications_enabled: boolean | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          metadata: Json | null
          name: string
          phone: string
          postal_code: string
          practice_image_url: string | null
          practice_type: Database["public"]["Enums"]["practice_type"]
          registration_number: string
          settings: Json | null
          sms_notifications_enabled: boolean | null
          state_province: string | null
          tax_percentage: number | null
          two_factor_auth_required: boolean | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          appointment_reminder_enabled?: boolean | null
          business_hours?: Json | null
          city: string
          country?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string
          email: string
          email_notifications_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          phone: string
          postal_code: string
          practice_image_url?: string | null
          practice_type?: Database["public"]["Enums"]["practice_type"]
          registration_number: string
          settings?: Json | null
          sms_notifications_enabled?: boolean | null
          state_province?: string | null
          tax_percentage?: number | null
          two_factor_auth_required?: boolean | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          appointment_reminder_enabled?: boolean | null
          business_hours?: Json | null
          city?: string
          country?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string
          email?: string
          email_notifications_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          phone?: string
          postal_code?: string
          practice_image_url?: string | null
          practice_type?: Database["public"]["Enums"]["practice_type"]
          registration_number?: string
          settings?: Json | null
          sms_notifications_enabled?: boolean | null
          state_province?: string | null
          tax_percentage?: number | null
          two_factor_auth_required?: boolean | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      visit_vitals: {
        Row: {
          bp: string | null
          created_at: string | null
          hr: string | null
          id: string
          temp: string | null
          visit_id: string
          weight: string | null
        }
        Insert: {
          bp?: string | null
          created_at?: string | null
          hr?: string | null
          id?: string
          temp?: string | null
          visit_id: string
          weight?: string | null
        }
        Update: {
          bp?: string | null
          created_at?: string | null
          hr?: string | null
          id?: string
          temp?: string | null
          visit_id?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_vitals_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          created_at: string | null
          date: string
          doctor: string
          id: string
          notes: string | null
          patient_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor: string
          id?: string
          notes?: string | null
          patient_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor?: string
          id?: string
          notes?: string | null
          patient_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      practice_type:
        | "medical"
        | "dental"
        | "pharmacy"
        | "clinic"
        | "hospital"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
