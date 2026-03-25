import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Home, Briefcase, Camera, Award,
  CheckCircle, MapPin, Phone, Star, ArrowLeft, Globe,
  Calendar, FileText, Clock, MessageSquare,
} from 'lucide-react'
import { AGENT_TYPE_LABELS, AGENT_SPECIALIZATION_LABELS } from '@/lib/constants'
import AdminAgentActions from './AdminAgentActions'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin
    .from('agents')
    .select('business_name')
    .eq('id', id)
    .single()
  return { title: `${data?.business_name || 'Agent'} | Admin` }
}

const agentTypeIcons: Record<string, any> = {
  real_estate_agent: Building2,
  property_manager:  Home,
  home_builder:      Briefcase,
  photographer:      Camera,
  other:             Award,
}

export default async function AdminAgentDetailPage({ params }: Props) {
  const { id } = await params
  await requireAdmin()
  const admin = createAdminClient()

  const { data: agent, error } = await admin
    .from('agents')
    .select('*, agent_service_areas (city, is_primary)')
    .eq('id', id)
    .single()

  if (error || !agent) notFound()

  // Fetch profile separately to avoid FK join issues
  const { data: profileData } = await admin
    .from('profiles')
    .select('full_name, email, avatar_url, created_at')
    .eq('id', agent.user_id)
    .single()
  const profile = profileData as any
  const Icon = agentTypeIcons[agent.agent_type] || Award
  const serviceAreas = (agent.agent_service_areas as any[]) || []

  const avatarBg: Record<string, string> = {
    active:    'bg-[#212529] text-white',
    pending:   'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-600',
    inactive:  'bg-[#F8F9FA] text-[#ADB5BD]',
  }
  const avatarClass = avatarBg[agent.status] ?? avatarBg.inactive

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl font-bold ${avatarClass}`}>
                {(agent.business_name || profile?.full_name || 'A')[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${
                    agent.status === 'active'    ? 'bg-green-50 text-green-700 border-green-200' :
                    agent.status === 'pending'   ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    agent.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {agent.status}
                  </span>
                  {agent.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                  {agent.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                      <Star size={10} className="fill-amber-500" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="text-[22px] font-bold text-[#212529] leading-tight">
                  {agent.business_name || profile?.full_name || '—'}
                </h1>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-[#495057]">
                  <Icon size={13} className="flex-shrink-0" />
                  <span>{AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}</span>
                </div>
                {profile?.email && (
                  <p className="text-xs text-[#ADB5BD] mt-1">{profile.email}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {agent.bio && (
              <div className="mt-5 pt-4 border-t border-[#F1F3F5]">
                <p className="text-sm text-[#495057] leading-relaxed">{agent.bio}</p>
              </div>
            )}
          </div>

          {/* Professional Details card */}
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ADB5BD] mb-4">Professional Details</h2>
            <div className="space-y-3">
              {agent.years_experience ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-[#495057]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#ADB5BD]">Experience</p>
                    <p className="text-sm font-medium text-[#212529]">{agent.years_experience} years</p>
                  </div>
                </div>
              ) : null}
              {agent.license_number ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-[#495057]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#ADB5BD]">License #</p>
                    <p className="text-sm font-medium text-[#212529] font-mono">{agent.license_number}</p>
                  </div>
                </div>
              ) : null}
              {agent.phone ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-[#495057]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#ADB5BD]">Phone</p>
                    <p className="text-sm font-medium text-[#212529]">{agent.phone}</p>
                  </div>
                </div>
              ) : null}
              {agent.office_city ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-[#495057]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#ADB5BD]">Office City</p>
                    <p className="text-sm font-medium text-[#212529]">{agent.office_city}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-[#495057]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#ADB5BD]">Member since</p>
                  <p className="text-sm font-medium text-[#212529]">
                    {new Date(profile?.created_at || agent.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-[#495057]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#ADB5BD]">Reviews</p>
                  <p className="text-sm font-medium text-[#212529]">
                    {agent.total_reviews || 0} reviews
                    {agent.avg_rating ? (
                      <span className="text-amber-500 ml-1.5">★ {Number(agent.avg_rating).toFixed(1)}</span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Areas */}
            {serviceAreas.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#F1F3F5]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD] mb-2.5">Service Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area: any) => (
                    <span
                      key={area.city}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        area.is_primary
                          ? 'bg-[#212529] text-white'
                          : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]'
                      }`}
                    >
                      {area.city}{area.is_primary ? ' ·\u00a0primary' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {agent.specializations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F1F3F5]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD] mb-2.5">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.specializations.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] rounded-full text-xs font-medium">
                      {AGENT_SPECIALIZATION_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {agent.languages?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F1F3F5]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD] mb-2 flex items-center gap-1.5">
                  <Globe size={11} /> Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.languages.map((lang: string) => (
                    <span key={lang} className="px-2.5 py-1 bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] rounded-full text-xs font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="space-y-3">
          <AdminAgentActions
            agentId={agent.id}
            currentStatus={agent.status}
            currentVerified={agent.verified}
            currentFeatured={agent.featured}
            agentSlug={agent.slug}
          />
        </div>
      </div>
    </div>
  )
}
