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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          min_subtotal: number
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          min_subtotal?: number
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          min_subtotal?: number
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      fia_categories: {
        Row: {
          accent_color: string
          created_at: string
          description: string
          icon_url: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          subtitle: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          subtitle?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      fia_mcqs: {
        Row: {
          category_id: string
          correct_index: number
          created_at: string
          explanation: string
          id: string
          options: string[]
          question: string
          updated_at: string
        }
        Insert: {
          category_id: string
          correct_index: number
          created_at?: string
          explanation?: string
          id?: string
          options: string[]
          question: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          correct_index?: number
          created_at?: string
          explanation?: string
          id?: string
          options?: string[]
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fia_mcqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fia_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fia_posts: {
        Row: {
          created_at: string
          description: string
          id: string
          images: string[]
          title: string
          updated_at: string
          videos: string[]
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          title: string
          updated_at?: string
          videos?: string[]
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          title?: string
          updated_at?: string
          videos?: string[]
        }
        Relationships: []
      }
      home_items: {
        Row: {
          action: string | null
          active: boolean
          created_at: string
          description: string
          hot: boolean
          href: string | null
          icon_tone: string
          id: string
          logo_url: string | null
          name: string
          price: number
          sold_count: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          action?: string | null
          active?: boolean
          created_at?: string
          description?: string
          hot?: boolean
          href?: string | null
          icon_tone?: string
          id?: string
          logo_url?: string | null
          name: string
          price?: number
          sold_count?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          action?: string | null
          active?: boolean
          created_at?: string
          description?: string
          hot?: boolean
          href?: string | null
          icon_tone?: string
          id?: string
          logo_url?: string | null
          name?: string
          price?: number
          sold_count?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lucky_entries: {
        Row: {
          amount: number
          basket_id: string
          created_at: string
          draw_date: string
          email: string | null
          id: string
          name: string
          phone: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          basket_id: string
          created_at?: string
          draw_date?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          basket_id?: string
          created_at?: string
          draw_date?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lucky_settings: {
        Row: {
          id: number
          prize_amount: number
          updated_at: string
        }
        Insert: {
          id?: number
          prize_amount?: number
          updated_at?: string
        }
        Update: {
          id?: number
          prize_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      lucky_winners: {
        Row: {
          claimed: boolean
          created_at: string
          draw_date: string
          entry_id: string
          id: string
          prize_amount: number
          user_id: string | null
        }
        Insert: {
          claimed?: boolean
          created_at?: string
          draw_date: string
          entry_id: string
          id?: string
          prize_amount: number
          user_id?: string | null
        }
        Update: {
          claimed?: boolean
          created_at?: string
          draw_date?: string
          entry_id?: string
          id?: string
          prize_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lucky_winners_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "lucky_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          shipping: number
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          shipping?: number
          shipping_address: string
          shipping_city: string
          shipping_country?: string
          shipping_postal_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          shipping?: number
          shipping_address?: string
          shipping_city?: string
          shipping_country?: string
          shipping_postal_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          brand: string | null
          category_id: string | null
          compare_price: number | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          images: string[]
          name: string
          price: number
          rating: number
          review_count: number
          short_description: string | null
          sku: string | null
          slug: string
          stock: number
          trending: boolean
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          brand?: string | null
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string[]
          name: string
          price?: number
          rating?: number
          review_count?: number
          short_description?: string | null
          sku?: string | null
          slug: string
          stock?: number
          trending?: boolean
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          brand?: string | null
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string[]
          name?: string
          price?: number
          rating?: number
          review_count?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock?: number
          trending?: boolean
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          amount: number
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notifications_log: {
        Row: {
          body: string
          created_at: string
          failed_count: number
          icon: string | null
          id: string
          sent_by: string | null
          sent_count: number
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          failed_count?: number
          icon?: string | null
          id?: string
          sent_by?: string | null
          sent_count?: number
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          failed_count?: number
          icon?: string | null
          id?: string
          sent_by?: string | null
          sent_count?: number
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_seen_at: string
          p256dh: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_seen_at?: string
          p256dh: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_seen_at?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      referral_settings: {
        Row: {
          id: number
          max_promo_per_user: number
          max_referrals_per_user: number
          promo_amount: number
          promo_code: string
          referral_reward: number
          updated_at: string
        }
        Insert: {
          id?: number
          max_promo_per_user?: number
          max_referrals_per_user?: number
          promo_amount?: number
          promo_code?: string
          referral_reward?: number
          updated_at?: string
        }
        Update: {
          id?: number
          max_promo_per_user?: number
          max_referrals_per_user?: number
          promo_amount?: number
          promo_code?: string
          referral_reward?: number
          updated_at?: string
        }
        Relationships: []
      }
      referral_submissions: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          note: string | null
          reviewed_at: string | null
          reward_pkr: number
          screenshot_url: string
          status: Database["public"]["Enums"]["submission_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          note?: string | null
          reviewed_at?: string | null
          reward_pkr?: number
          screenshot_url: string
          status?: Database["public"]["Enums"]["submission_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          note?: string | null
          reviewed_at?: string | null
          reward_pkr?: number
          screenshot_url?: string
          status?: Database["public"]["Enums"]["submission_status"]
          user_id?: string
        }
        Relationships: []
      }
      site_announcements: {
        Row: {
          active: boolean
          id: number
          message: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          id?: number
          message?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          id?: number
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          announcement: string | null
          contact_email: string | null
          contact_phone: string | null
          fia_badge_url: string | null
          fia_brand_byline: string
          fia_brand_title: string
          fia_footer_text: string
          fia_header_brand: string
          fia_hero_subtitle: string
          fia_hero_tagline: string
          fia_hero_title: string
          fia_logo_url: string | null
          fia_main_logo_url: string | null
          fia_secondary_logo_url: string | null
          id: number
          lucky_logo_url: string | null
          lucky_subtitle: string | null
          lucky_title: string | null
          shop_hero_subtitle: string | null
          shop_hero_tag: string | null
          shop_hero_title: string | null
          shop_logo_url: string | null
          shop_store_name: string | null
          sim_database_logo_url: string | null
          store_hero_subtitle: string | null
          store_hero_tag: string | null
          store_hero_title: string | null
          store_logo_url: string | null
          store_name: string
          store1_theme: string
          store2_theme: string
          theme: string
          updated_at: string
          wa_channel_popup_delay_seconds: number
          wa_channel_popup_enabled: boolean
          wa_channel_popup_message: string | null
          wa_channel_url: string | null
          whatsapp_number: string | null
          whatsapp_popup_delay_seconds: number
          whatsapp_popup_enabled: boolean
          whatsapp_popup_message: string
        }
        Insert: {
          address?: string | null
          announcement?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          fia_badge_url?: string | null
          fia_brand_byline?: string
          fia_brand_title?: string
          fia_footer_text?: string
          fia_header_brand?: string
          fia_hero_subtitle?: string
          fia_hero_tagline?: string
          fia_hero_title?: string
          fia_logo_url?: string | null
          fia_main_logo_url?: string | null
          fia_secondary_logo_url?: string | null
          id?: number
          lucky_logo_url?: string | null
          lucky_subtitle?: string | null
          lucky_title?: string | null
          shop_hero_subtitle?: string | null
          shop_hero_tag?: string | null
          shop_hero_title?: string | null
          shop_logo_url?: string | null
          shop_store_name?: string | null
          sim_database_logo_url?: string | null
          store_hero_subtitle?: string | null
          store_hero_tag?: string | null
          store_hero_title?: string | null
          store_logo_url?: string | null
          store_name?: string
          store1_theme?: string
          store2_theme?: string
          theme?: string
          updated_at?: string
          wa_channel_popup_delay_seconds?: number
          wa_channel_popup_enabled?: boolean
          wa_channel_popup_message?: string | null
          wa_channel_url?: string | null
          whatsapp_number?: string | null
          whatsapp_popup_delay_seconds?: number
          whatsapp_popup_enabled?: boolean
          whatsapp_popup_message?: string
        }
        Update: {
          address?: string | null
          announcement?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          fia_badge_url?: string | null
          fia_brand_byline?: string
          fia_brand_title?: string
          fia_footer_text?: string
          fia_header_brand?: string
          fia_hero_subtitle?: string
          fia_hero_tagline?: string
          fia_hero_title?: string
          fia_logo_url?: string | null
          fia_main_logo_url?: string | null
          fia_secondary_logo_url?: string | null
          id?: number
          lucky_logo_url?: string | null
          lucky_subtitle?: string | null
          lucky_title?: string | null
          shop_hero_subtitle?: string | null
          shop_hero_tag?: string | null
          shop_hero_title?: string | null
          shop_logo_url?: string | null
          shop_store_name?: string | null
          sim_database_logo_url?: string | null
          store_hero_subtitle?: string | null
          store_hero_tag?: string | null
          store_hero_title?: string | null
          store_logo_url?: string | null
          store_name?: string
          store1_theme?: string
          store2_theme?: string
          theme?: string
          updated_at?: string
          wa_channel_popup_delay_seconds?: number
          wa_channel_popup_enabled?: boolean
          wa_channel_popup_message?: string | null
          wa_channel_url?: string | null
          whatsapp_number?: string | null
          whatsapp_popup_delay_seconds?: number
          whatsapp_popup_enabled?: boolean
          whatsapp_popup_message?: string
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      store_orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          notes: string | null
          payment_basket: string | null
          payment_status: string
          shipping_address: string
          shipping_city: string
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          items?: Json
          notes?: string | null
          payment_basket?: string | null
          payment_status?: string
          shipping_address: string
          shipping_city: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          notes?: string | null
          payment_basket?: string | null
          payment_status?: string
          shipping_address?: string
          shipping_city?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      store_products: {
        Row: {
          active: boolean
          category: string
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          gallery: Json | null
          id: string
          image_url: string | null
          in_stock: boolean
          old_price: number | null
          price: number
          sizes: string[] | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          gallery?: Json | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          old_price?: number | null
          price?: number
          sizes?: string[] | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          gallery?: Json | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          old_price?: number | null
          price?: number
          sizes?: string[] | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          admin_note: string | null
          amount: number
          bank_name: string | null
          created_at: string
          id: string
          method: string
          status: string
          updated_at: string
          user_id: string
          winner_id: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          admin_note?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          id?: string
          method: string
          status?: string
          updated_at?: string
          user_id: string
          winner_id?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_note?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "lucky_winners"
            referencedColumns: ["id"]
          },
        ]
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
      redeem_promo: { Args: { _code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "customer"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      submission_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "customer"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
