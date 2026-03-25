import { createAdminClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/admin'
import { notFound, redirect } from 'next/navigation'
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
  const { isAdmin } = await checkIsAdmin()
  if (!isAdmin) redirect('/unauthorized')
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
    active:    'bg-adm-accent/20 text-adm-accent',
    pending:   'bg-adm-amber/10 text-adm-amber',
    suspended: 'bg-adm-red/10 text-adm-red',
    inactive:  'bg-adm-surface-2 text-adm-faint',
  }
  const avatarClass = avatarBg[agent.status] ?? avatarBg.inactive

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-sm text-adm-muted hover:text-adm-text mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <div className="bg-adm-surface border border-adm-border p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className={`w-[72px] h-[72px] flex items-center justify-center flex-shrink-0 text-3xl font-bold ${avatarClass}`}>
                {(agent.business_name || profile?.full_name || 'A')[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Badges row */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 text-[11px] font-semibold border capitalize ${
                    agent.status === 'active'    ? 'bg-adm-green/10 text-adm-green border-adm-green/20' :
                    agent.status === 'pending'   ? 'bg-adm-amber/10 text-adm-amber border-adm-amber/20' :
                    agent.status === 'suspended' ? 'bg-adm-red/10 text-adm-red border-adm-red/20' :
                    'bg-adm-surface-2 text-adm-faint border-adm-border'
                  }`}>
                    {agent.status}
                  </span>
                  {agent.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-adm-green/10 text-adm-green border border-adm-green/20">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                  {agent.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-adm-amber/10 text-adm-amber border border-adm-amber/20">
                      <Star size={10} className="fill-adm-amber" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="text-[22px] font-bold text-adm-text leading-tight">
                  {agent.business_name || profile?.full_name || '—'}
                </h1>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-adm-muted">
                  <Icon size={13} className="flex-shrink-0" />
                  <span>{AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}</span>
                </div>
                {profile?.email && (
                  <p className="text-xs text-adm-faint mt-1">{profile.email}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {agent.bio && (
              <div className="mt-5 pt-4 border-t border-adm-border">
                <p className="text-sm text-adm-muted leading-relaxed">{agent.bio}</p>
              </div>
            )}
          </div>

          {/* Professional Details card */}
          <div className="bg-adm-surface border border-adm-border p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-adm-faint mb-4">Professional Details</h2>
            <div className="space-y-3">
              {agent.years_experience ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-adm-muted" />
                  </div>
                  <div>
                    <p className="text-[11px] text-adm-faint">Experience</p>
                    <p className="text-sm font-medium text-adm-text">{agent.years_experience} years</p>
                  </div>
                </div>
              ) : null}
              {agent.license_number ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-adm-muted" />
                  </div>
                  <div>
                    <p className="text-[11px] text-adm-faint">License #</p>
                    <p className="text-sm font-medium text-adm-text font-mono">{agent.license_number}</p>
                  </div>
                </div>
              ) : null}
              {agent.phone ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-adm-muted" />
                  </div>
                  <div>
                    <p className="text-[11px] text-adm-faint">Phone</p>
                    <p className="text-sm font-medium text-adm-text">{agent.phone}</p>
                  </div>
                </div>
              ) : null}
              {agent.office_city ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-adm-muted" />
                  </div>
                  <div>
                    <p className="text-[11px] text-adm-faint">Office City</p>
                    <p className="text-sm font-medium text-adm-text">{agent.office_city}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-adm-muted" />
                </div>
                <div>
                  <p className="text-[11px] text-adm-faint">Member since</p>
                  <p className="text-sm font-medium text-adm-text">
                    {new Date(profile?.created_at || agent.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-adm-muted" />
                </div>
                <div>
                  <p className="text-[11px] text-adm-faint">Reviews</p>
                  <p className="text-sm font-medium text-adm-text">
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
              <div className="mt-5 pt-4 border-t border-adm-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-adm-faint mb-2.5">Service Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area: any) => (
                    <span
                      key={area.city}
                      className={`px-2.5 py-1 text-xs font-medium ${
                        area.is_primary
                          ? 'bg-adm-accent/20 text-adm-accent border border-adm-accent/30'
                          : 'bg-adm-surface-2 text-adm-muted border border-adm-border'
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
              <div className="mt-4 pt-4 border-t border-adm-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-adm-faint mb-2.5">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.specializations.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-adm-surface-2 text-adm-muted border border-adm-border text-xs font-medium">
                      {AGENT_SPECIALIZATION_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {agent.languages?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-adm-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-adm-faint mb-2 flex items-center gap-1.5">
                  <Globe size={11} /> Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.languages.map((lang: string) => (
                    <span key={lang} className="px-2.5 py-1 bg-adm-surface-2 text-adm-muted border border-adm-border text-xs font-medium">
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
