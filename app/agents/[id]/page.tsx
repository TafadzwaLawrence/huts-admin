import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Home, Briefcase, Camera, Award,
  CheckCircle, MapPin, Phone, Star, ArrowLeft, Globe
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
    .select('name, email, avatar_url, created_at')
    .eq('id', agent.user_id)
    .single()
  const profile = profileData as any
  const Icon = agentTypeIcons[agent.agent_type] || Award
  const serviceAreas = (agent.agent_service_areas as any[]) || []

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
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#ADB5BD]">
                {(agent.business_name || profile?.name || 'A')[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-xl font-bold text-[#212529]">
                      {agent.business_name || profile?.name || '—'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[#495057]">
                      <Icon size={14} />
                      {AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}
                    </div>
                    <p className="text-xs text-[#ADB5BD] mt-1">{profile?.email}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      agent.status === 'active'    ? 'bg-green-50 text-green-700 border border-green-200' :
                      agent.status === 'pending'   ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      agent.status === 'suspended' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {agent.status}
                    </span>
                    {agent.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                    {agent.featured && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#212529] font-medium">
                        <Star size={12} className="fill-[#212529]" /> Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {agent.bio && (
              <div className="mt-4 pt-4 border-t border-[#F1F3F5]">
                <p className="text-sm text-[#495057] leading-relaxed">{agent.bio}</p>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="font-semibold text-[#212529] mb-4">Professional Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {agent.years_experience ? (
                <div>
                  <dt className="text-[#ADB5BD] mb-0.5">Experience</dt>
                  <dd className="font-medium text-[#212529]">{agent.years_experience} years</dd>
                </div>
              ) : null}
              {agent.license_number ? (
                <div>
                  <dt className="text-[#ADB5BD] mb-0.5">License #</dt>
                  <dd className="font-medium text-[#212529]">{agent.license_number}</dd>
                </div>
              ) : null}
              {agent.phone ? (
                <div>
                  <dt className="text-[#ADB5BD] mb-0.5">Phone</dt>
                  <dd className="font-medium text-[#212529] flex items-center gap-1">
                    <Phone size={12} /> {agent.phone}
                  </dd>
                </div>
              ) : null}
              {agent.office_city ? (
                <div>
                  <dt className="text-[#ADB5BD] mb-0.5">Office City</dt>
                  <dd className="font-medium text-[#212529] flex items-center gap-1">
                    <MapPin size={12} /> {agent.office_city}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[#ADB5BD] mb-0.5">Member since</dt>
                <dd className="font-medium text-[#212529]">
                  {new Date(profile?.created_at || agent.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-[#ADB5BD] mb-0.5">Reviews</dt>
                <dd className="font-medium text-[#212529]">
                  {agent.total_reviews || 0} reviews
                  {agent.avg_rating ? ` · ${Number(agent.avg_rating).toFixed(1)} ⭐` : ''}
                </dd>
              </div>
            </dl>

            {/* Service Areas */}
            {serviceAreas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F1F3F5]">
                <p className="text-xs font-semibold text-[#212529] mb-2">Service Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area: any) => (
                    <span
                      key={area.city}
                      className={`px-2 py-1 rounded-full text-xs ${
                        area.is_primary
                          ? 'bg-[#212529] text-white'
                          : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]'
                      }`}
                    >
                      {area.city}{area.is_primary ? ' (primary)' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {agent.specializations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F1F3F5]">
                <p className="text-xs font-semibold text-[#212529] mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.specializations.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] rounded-full text-xs">
                      {AGENT_SPECIALIZATION_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {agent.languages?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F1F3F5]">
                <p className="text-xs font-semibold text-[#212529] mb-2 flex items-center gap-1.5">
                  <Globe size={12} /> Languages
                </p>
                <p className="text-sm text-[#495057]">{agent.languages.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="space-y-4">
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
