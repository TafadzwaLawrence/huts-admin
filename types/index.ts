import { Database } from './database'

export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type PropertyImage = Database['public']['Tables']['property_images']['Row']
export type PropertyImageInsert = Database['public']['Tables']['property_images']['Insert']

export type SavedProperty = Database['public']['Tables']['saved_properties']['Row']

// Agent types - COMMENTED OUT until migration is run
// Uncomment after running supabase/migrations/021_agents_system.sql and regenerating types
/*
export type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']
export type AgentProfileInsert = Database['public']['Tables']['agent_profiles']['Insert']
export type AgentProfileUpdate = Database['public']['Tables']['agent_profiles']['Update']

export type AgentReview = Database['public']['Tables']['agent_reviews']['Row']
export type AgentReviewInsert = Database['public']['Tables']['agent_reviews']['Insert']
export type AgentReviewUpdate = Database['public']['Tables']['agent_reviews']['Update']

export type AgentServiceArea = Database['public']['Tables']['agent_service_areas']['Row']
export type AgentInquiry = Database['public']['Tables']['agent_inquiries']['Row']
export type AgentInquiryInsert = Database['public']['Tables']['agent_inquiries']['Insert']
export type AgentAchievement = Database['public']['Tables']['agent_achievements']['Row']
export type AgentAdvertisement = Database['public']['Tables']['agent_advertisements']['Row']
*/

// Temporary placeholder types until migration runs
export type AgentProfile = any
export type AgentProfileInsert = any
export type AgentProfileUpdate = any
export type AgentReview = any
export type AgentReviewInsert = any
export type AgentReviewUpdate = any
export type AgentServiceArea = any
export type AgentInquiry = any
export type AgentInquiryInsert = any
export type AgentAchievement = any
export type AgentAdvertisement = any

export type PropertyWithImages = Property & {
  property_images: PropertyImage[]
  profiles: Pick<Profile, 'name' | 'avatar_url' | 'verified'>
}

export type AgentProfileWithDetails = any // AgentProfile & { agent_service_areas: AgentServiceArea[]; agent_achievements: AgentAchievement[]; agent_reviews: AgentReview[] }

// Type guards for listing types
export function isRentalProperty(property: Property | PropertyWithImages): boolean {
  return property.listing_type === 'rent' || property.listing_type === null // null defaults to rent
}

export function isSaleProperty(property: Property | PropertyWithImages): boolean {
  return property.listing_type === 'sale'
}

// Type guard for student properties
export function isStudentProperty(property: Property | PropertyWithImages): boolean {
  return property.property_type === 'student'
}

export type PropertyCardProps = {
  property: PropertyWithImages
}
