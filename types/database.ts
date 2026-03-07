export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'landlord' | 'renter' | 'admin'
          bio: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'landlord' | 'renter' | 'admin'
          bio?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'landlord' | 'renter' | 'admin'
          bio?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          property_type: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student'
          status: 'draft' | 'active' | 'rented' | 'inactive' | 'sold'
          listing_type: 'rent' | 'sale' | null
          price: number | null
          sale_price: number | null
          deposit: number | null
          furnished: boolean | null
          shared_rooms: boolean | null
          utilities_included: boolean | null
          nearby_universities: Json | null
          student_lease_terms: string | null
          beds: number
          baths: number
          sqft: number | null
          address: string
          city: string
          state: string | null
          zip_code: string | null
          neighborhood: string | null
          lat: number | null
          lng: number | null
          amenities: Json
          available_from: string | null
          lease_term: string | null
          property_tax_annual: number | null
          hoa_fee_monthly: number | null
          year_built: number | null
          lot_size_sqft: number | null
          parking_spaces: number | null
          garage_spaces: number | null
          stories: number | null
          slug: string
          meta_description: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          property_type: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student'
          status?: 'draft' | 'active' | 'rented' | 'inactive' | 'sold'
          listing_type?: 'rent' | 'sale' | null
          price?: number | null
          sale_price?: number | null
          deposit?: number | null
          beds: number
          baths: number
          sqft?: number | null
          address: string
          city: string
          state?: string | null
          zip_code?: string | null
          neighborhood?: string | null
          lat?: number | null
          lng?: number | null
          amenities?: Json
          available_from?: string | null
          lease_term?: string | null
          property_tax_annual?: number | null
          hoa_fee_monthly?: number | null
          year_built?: number | null
          lot_size_sqft?: number | null
          parking_spaces?: number | null
          garage_spaces?: number | null
          stories?: number | null
          slug?: string
          meta_description?: string | null
          furnished?: boolean | null
          shared_rooms?: boolean | null
          utilities_included?: boolean | null
          nearby_universities?: Json | null
          student_lease_terms?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          property_type?: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student'
          status?: 'draft' | 'active' | 'rented' | 'inactive' | 'sold'
          listing_type?: 'rent' | 'sale' | null
          price?: number | null
          sale_price?: number | null
          deposit?: number | null
          beds?: number
          baths?: number
          sqft?: number | null
          address?: string
          city?: string
          state?: string | null
          zip_code?: string | null
          neighborhood?: string | null
          lat?: number | null
          lng?: number | null
          amenities?: Json
          available_from?: string | null
          lease_term?: string | null
          property_tax_annual?: number | null
          hoa_fee_monthly?: number | null
          year_built?: number | null
          lot_size_sqft?: number | null
          parking_spaces?: number | null
          garage_spaces?: number | null
          stories?: number | null
          slug?: string
          meta_description?: string | null
          furnished?: boolean | null
          shared_rooms?: boolean | null
          utilities_included?: boolean | null
          nearby_universities?: Json | null
          student_lease_terms?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          thumbnail_url: string | null
          alt_text: string | null
          order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          thumbnail_url?: string | null
          alt_text?: string | null
          order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          thumbnail_url?: string | null
          alt_text?: string | null
          order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      saved_properties: {
        Row: {
          user_id: string
          property_id: string
          saved_at: string
          notes: string | null
        }
        Insert: {
          user_id: string
          property_id: string
          saved_at?: string
          notes?: string | null
        }
        Update: {
          user_id?: string
          property_id?: string
          saved_at?: string
          notes?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          author_id: string
          rating: number
          title: string
          comment: string
          is_verified: boolean
          inquiry_id: string | null
          status: 'pending' | 'published' | 'flagged' | 'hidden' | 'deleted'
          flagged_reason: string | null
          flagged_at: string | null
          editable_until: string | null
          edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          author_id: string
          rating: number
          title: string
          comment: string
          is_verified?: boolean
          inquiry_id?: string | null
          status?: 'pending' | 'published' | 'flagged' | 'hidden' | 'deleted'
          flagged_reason?: string | null
          flagged_at?: string | null
          editable_until?: string | null
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          author_id?: string
          rating?: number
          title?: string
          comment?: string
          is_verified?: boolean
          inquiry_id?: string | null
          status?: 'pending' | 'published' | 'flagged' | 'hidden' | 'deleted'
          flagged_reason?: string | null
          flagged_at?: string | null
          editable_until?: string | null
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      review_responses: {
        Row: {
          id: string
          review_id: string
          landlord_id: string
          response: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          landlord_id: string
          response: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          landlord_id?: string
          response?: string
          created_at?: string
          updated_at?: string
        }
      }
      review_votes: {
        Row: {
          review_id: string
          user_id: string
          helpful: boolean
          created_at: string
        }
        Insert: {
          review_id: string
          user_id: string
          helpful: boolean
          created_at?: string
        }
        Update: {
          review_id?: string
          user_id?: string
          helpful?: boolean
          created_at?: string
        }
      }
    }
  }
}
