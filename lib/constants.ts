/**
 * Design System Constants
 * Centralized constants for consistent UI implementation across the application
 */

/**
 * Standard icon sizes for consistent visual hierarchy
 * Use these constants instead of hardcoded pixel values
 * 
 * @example
 * import { ICON_SIZES } from '@/lib/constants'
 * <Search size={ICON_SIZES.md} />
 */
export const ICON_SIZES = {
  xs: 12,   // Tiny inline icons (badges, tight spaces)
  sm: 14,   // Small inline icons (text labels, compact UI)
  md: 16,   // Standard buttons/cards (default for most use cases)
  lg: 20,   // Large buttons/features (CTAs, emphasis)
  xl: 24,   // Decorative/section headers
  '2xl': 32, // Hero sections, large decorative
  '3xl': 48, // Empty states, major decorative elements
} as const

export type IconSize = keyof typeof ICON_SIZES

/**
 * Standard spacing values matching Tailwind's spacing scale
 * Use for consistent padding, margins, and gaps
 */
export const SPACING = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const

/**
 * Container max-widths for different layouts
 */
export const CONTAINER_WIDTHS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  content: '1280px', // Standard content width
} as const

/**
 * Z-index layers for consistent stacking
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const

/**
 * Breakpoint values (must match tailwind.config.ts)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Tiny 1x1 pixel gray base64 image for blur-up placeholder.
 * Use with Next.js Image: placeholder="blur" blurDataURL={BLUR_PLACEHOLDER}
 */
export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P7DfwAJhAPk0x1VwQAAAABJRU5ErkJggg=='

/**
 * Social Media Links - Official Huts social profiles
 */
export const SOCIAL_LINKS = {
  twitter: 'https://x.com/HutsZw',
  instagram: 'https://www.instagram.com/hutszw/',
  facebook: 'https://www.facebook.com/profile.php?id=61588374308860',
} as const

/**
 * Zimbabwe Cities & Towns — single source of truth for all city pickers
 * Covers urban councils, towns, municipalities, and major growth points
 */
export const ZIMBABWE_CITIES = [
  // Harare Province
  'Harare', 'Chitungwiza', 'Epworth', 'Ruwa', 'Norton',
  // Bulawayo Province
  'Bulawayo',
  // Manicaland
  'Mutare', 'Chipinge', 'Rusape', 'Chimanimani', 'Nyanga', 'Birchenough Bridge',
  // Mashonaland Central
  'Bindura', 'Mvurwi', 'Shamva', 'Guruve', 'Centenary',
  // Mashonaland East
  'Marondera', 'Macheke', 'Murewa', 'Hwedza', 'Wedza',
  // Mashonaland West
  'Chinhoyi', 'Kadoma', 'Chegutu', 'Karoi', 'Kariba', 'Banket',
  // Masvingo
  'Masvingo', 'Chiredzi', 'Triangle', 'Gutu', 'Bikita',
  // Matabeleland North
  'Victoria Falls', 'Hwange', 'Lupane', 'Binga', 'Dete',
  // Matabeleland South
  'Beitbridge', 'Gwanda', 'Plumtree', 'Esigodini', 'West Nicholson',
  // Midlands
  'Gweru', 'Kwekwe', 'Redcliff', 'Zvishavane', 'Shurugwi', 'Gokwe', 'Lalapanzi',
] as const

export type ZimbabweCity = typeof ZIMBABWE_CITIES[number]

/**
 * Agent Types - Professional categories for the agent marketplace
 */
export const AGENT_TYPES = {
  REAL_ESTATE_AGENT: 'real_estate_agent',
  PROPERTY_MANAGER: 'property_manager',
  HOME_BUILDER: 'home_builder',
  PHOTOGRAPHER: 'photographer',
  OTHER: 'other',
} as const

export const AGENT_TYPE_LABELS = {
  [AGENT_TYPES.REAL_ESTATE_AGENT]: 'Real Estate Agent',
  [AGENT_TYPES.PROPERTY_MANAGER]: 'Property Manager',
  [AGENT_TYPES.HOME_BUILDER]: 'Home Builder',
  [AGENT_TYPES.PHOTOGRAPHER]: 'Real Estate Photographer',
  [AGENT_TYPES.OTHER]: 'Other Professional',
} as const

/**
 * Agent Specializations - Areas of expertise
 */
export const AGENT_SPECIALIZATIONS = [
  'luxury_homes',
  'first_time_buyers',
  'commercial',
  'investment',
  'student_housing',
  'rental_management',
  'affordable_housing',
  'new_construction',
  'foreclosures',
  'land_sales',
  'vacation_rentals',
  'senior_living',
] as const

export const AGENT_SPECIALIZATION_LABELS: Record<string, string> = {
  luxury_homes: 'Luxury Homes',
  first_time_buyers: 'First-Time Buyers',
  commercial: 'Commercial Properties',
  investment: 'Investment Properties',
  student_housing: 'Student Housing',
  rental_management: 'Rental Management',
  affordable_housing: 'Affordable Housing',
  new_construction: 'New Construction',
  foreclosures: 'Foreclosures & Short Sales',
  land_sales: 'Land & Lots',
  vacation_rentals: 'Vacation Rentals',
  senior_living: 'Senior Living',
}

/**
 * Agent Inquiry Types
 */
export const INQUIRY_TYPES = {
  GENERAL: 'general',
  BUYING: 'buying',
  SELLING: 'selling',
  RENTING: 'renting',
  PROPERTY_MANAGEMENT: 'property_management',
  PHOTOGRAPHY: 'photography',
  OTHER: 'other',
} as const

export const INQUIRY_TYPE_LABELS = {
  [INQUIRY_TYPES.GENERAL]: 'General Inquiry',
  [INQUIRY_TYPES.BUYING]: 'Looking to Buy',
  [INQUIRY_TYPES.SELLING]: 'Looking to Sell',
  [INQUIRY_TYPES.RENTING]: 'Looking to Rent',
  [INQUIRY_TYPES.PROPERTY_MANAGEMENT]: 'Property Management Services',
  [INQUIRY_TYPES.PHOTOGRAPHY]: 'Photography Services',
  [INQUIRY_TYPES.OTHER]: 'Other Services',
} as const

/**
 * Agent Achievement Types
 */
export const ACHIEVEMENT_TYPES = {
  TOP_PERFORMER: 'top_performer',
  QUICK_RESPONDER: 'quick_responder',
  VERIFIED_AGENT: 'verified_agent',
  LUXURY_SPECIALIST: 'luxury_specialist',
  '100_PROPERTIES': '100_properties',
  '50_REVIEWS': '50_reviews',
  '5_STAR_AGENT': '5_star_agent',
  RISING_STAR: 'rising_star',
  YEARS_EXPERIENCE_5: 'years_experience_5',
  YEARS_EXPERIENCE_10: 'years_experience_10',
  CERTIFIED_PROFESSIONAL: 'certified_professional',
} as const

export const ACHIEVEMENT_LABELS: Record<string, { title: string; description: string }> = {
  top_performer: {
    title: 'Top Performer',
    description: 'In the top 10% of agents by inquiries this month',
  },
  quick_responder: {
    title: 'Quick Responder',
    description: 'Responds to inquiries within 2 hours on average',
  },
  verified_agent: {
    title: 'Verified Agent',
    description: 'Identity and credentials verified by Huts',
  },
  luxury_specialist: {
    title: 'Luxury Specialist',
    description: 'Specializes in high-end luxury properties',
  },
  '100_properties': {
    title: '100+ Properties',
    description: 'Successfully listed over 100 properties',
  },
  '50_reviews': {
    title: '50+ Reviews',
    description: 'Received 50 or more client reviews',
  },
  '5_star_agent': {
    title: '5-Star Agent',
    description: 'Maintains 4.9+ average rating with 20+ reviews',
  },
  rising_star: {
    title: 'Rising Star',
    description: 'New agent with exceptional early performance',
  },
  years_experience_5: {
    title: '5+ Years Experience',
    description: 'Over 5 years of professional experience',
  },
  years_experience_10: {
    title: '10+ Years Experience',
    description: 'Over 10 years of professional experience',
  },
  certified_professional: {
    title: 'Certified Professional',
    description: 'Holds professional certifications in real estate',
  },
}

/**
 * Languages commonly spoken in Zimbabwe
 */
export const LANGUAGES = [
  'English',
  'Shona',
  'Ndebele',
  'Kalanga',
  'Shangani',
  'Venda',
  'Tonga',
  'Sotho',
  'Afrikaans',
  'Portuguese',
] as const
