import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import EditUserForm from '@/app/users/[id]/EditUserForm'
import {
  Building2, FileText, ArrowLeft, Star, MapPin, Home,
  CheckCircle, XCircle, Mail, Phone, Calendar, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { AdminStatCard } from '@/components/admin'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function UserDetails({ userId }: { userId: string }) {
  const admin = createAdminClient()

  const { data: userData, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !userData) notFound()

  const [
    { data: userProperties },
    { data: userReviews },
    { count: reviewsReceived },
    { data: userConversations },
  ] = await Promise.all([
    admin
      .from('properties')
      .select('id, title, city, area, status, verification_status, listing_type, price, sale_price, bedrooms, bathrooms, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('reviews')
      .select('id, rating, title, comment, status, created_at, properties!reviews_property_id_fkey(title, city)')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .in(
        'property_id',
        (await admin.from('properties').select('id').eq('user_id', userId)).data?.map((p: any) => p.id) ?? []
      ),
    admin
      .from('conversations')
      .select('id, last_message_at, last_message_preview, properties!conversations_property_id_fkey(title)')
      .or(`renter_id.eq.${userId},landlord_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })
      .limit(5),
  ])

  const stats = {
    propertiesCount: userProperties?.length ?? 0,
    reviewsWritten: userReviews?.length ?? 0,
    reviewsReceived: reviewsReceived ?? 0,
    conversations: userConversations?.length ?? 0,
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/users" className="p-2 hover:bg-adm-surface-2 transition-colors">
          <ArrowLeft size={20} className="text-adm-muted" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-adm-text truncate">{userData.full_name || 'Unnamed User'}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm text-adm-muted">{userData.email}</span>
            <span className={`text-[10px] px-2 py-0.5 font-semibold ${
              userData.role === 'landlord' ? 'bg-adm-green/10 text-adm-green' :
              userData.role === 'agent'    ? 'bg-adm-amber/10 text-adm-amber' :
              userData.role === 'admin'    ? 'bg-adm-accent/10 text-adm-accent' :
                                             'bg-adm-surface-2 text-adm-faint'
            }`}>{userData.role}</span>
            {userData.verified && (
              <span className="text-[10px] bg-adm-green/10 text-adm-green px-2 py-0.5 flex items-center gap-1">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AdminStatCard label="Properties"       value={stats.propertiesCount}  icon={Building2} />
        <AdminStatCard label="Reviews Written"  value={stats.reviewsWritten}   icon={Star} />
        <AdminStatCard label="Reviews Received" value={stats.reviewsReceived}  icon={FileText} />
        <AdminStatCard label="Conversations"    value={stats.conversations}    icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Edit Form */}
          <div className="bg-adm-surface border border-adm-border p-6">
            <h2 className="text-sm font-semibold text-adm-text mb-5">User Information</h2>
            <EditUserForm user={userData} />
          </div>

          {/* User's Properties */}
          <div className="bg-adm-surface border border-adm-border overflow-hidden">
            <div className="px-5 py-4 border-b border-adm-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
                <Building2 size={13} className="text-adm-accent" />
                Properties ({stats.propertiesCount})
              </h2>
              <Link href={`/properties?owner=${userId}`} className="text-xs text-adm-muted hover:text-adm-text">All →</Link>
            </div>
            {!userProperties || userProperties.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-adm-muted">No properties listed</div>
            ) : (
              <div className="divide-y divide-adm-border">
                {userProperties.map((p: any) => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-adm-surface-2 transition-colors">
                    <div className="w-8 h-8 bg-adm-surface-2 flex items-center justify-center flex-shrink-0">
                      <Home size={13} className="text-adm-faint" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-adm-text truncate">{p.title}</p>
                      <p className="text-[11px] text-adm-muted flex items-center gap-1 mt-0.5">
                        <MapPin size={9} /> {p.area ? `${p.area}, ` : ''}{p.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 ${
                        p.verification_status === 'approved' ? 'bg-adm-green/10 text-adm-green' :
                        p.verification_status === 'pending'  ? 'bg-adm-amber/10 text-adm-amber' :
                        'bg-adm-red/10 text-adm-red'
                      }`}>{p.verification_status}</span>
                      <span className="text-[10px] bg-adm-surface-2 text-adm-muted px-1.5 py-0.5">
                        {p.listing_type === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                      <Link href={`/properties/${p.id}`} className="text-[10px] text-adm-muted hover:text-adm-text underline">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User's Reviews */}
          <div className="bg-adm-surface border border-adm-border overflow-hidden">
            <div className="px-5 py-4 border-b border-adm-border">
              <h2 className="text-sm font-semibold text-adm-text flex items-center gap-2">
                <Star size={13} className="text-adm-amber" />
                Reviews Written ({stats.reviewsWritten})
              </h2>
            </div>
            {!userReviews || userReviews.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-adm-muted">No reviews written</div>
            ) : (
              <div className="divide-y divide-adm-border">
                {userReviews.map((r: any) => (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={10} className={s <= r.rating ? 'fill-adm-amber text-adm-amber' : 'text-adm-border'} />
                            ))}
                          </span>
                          <span className="text-[10px] text-adm-muted">{(r.properties as any)?.title ?? 'Unknown property'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 ${
                            r.status === 'published' ? 'bg-adm-green/10 text-adm-green' :
                            r.status === 'flagged'   ? 'bg-adm-red/10 text-adm-red' :
                            r.status === 'pending'   ? 'bg-adm-amber/10 text-adm-amber' :
                            'bg-adm-surface-2 text-adm-faint'
                          }`}>{r.status}</span>
                        </div>
                        <p className="text-xs font-medium text-adm-text">{r.title}</p>
                        <p className="text-xs text-adm-muted mt-0.5 line-clamp-2">{r.comment}</p>
                      </div>
                      <span className="text-[10px] text-adm-faint flex-shrink-0">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-adm-surface border border-adm-red/20 p-6">
            <h2 className="text-sm font-semibold text-adm-red mb-1">Danger Zone</h2>
            <p className="text-xs text-adm-muted mb-5">Irreversible and destructive actions</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-adm-text">Delete User</p>
                <p className="text-xs text-adm-muted mt-0.5">Permanently removes this user and all their data</p>
              </div>
              <form action={`/api/users/${userId}`} method="DELETE">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-adm-red text-white hover:bg-adm-red/80 transition-colors"
                  onClick={(e) => {
                    if (!confirm('Are you absolutely sure? This cannot be undone.')) e.preventDefault()
                  }}
                >
                  Delete User
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right sidebar: profile card + conversations */}
        <div className="space-y-5">
          <div className="bg-adm-surface border border-adm-border p-5">
            <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider mb-4">Profile</h3>
            <div className="w-14 h-14 bg-adm-accent/15 flex items-center justify-center font-bold text-adm-accent text-xl mb-3">
              {(userData.full_name || userData.email)?.[0]?.toUpperCase()}
            </div>
            <div className="space-y-2.5">
              {userData.phone && (
                <div className="flex items-center gap-2 text-xs text-adm-muted">
                  <Phone size={12} /> {userData.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-adm-muted">
                <Mail size={12} /> <span className="truncate">{userData.email}</span>
              </div>
              {userData.city && (
                <div className="flex items-center gap-2 text-xs text-adm-muted">
                  <MapPin size={12} /> {userData.city}{userData.area ? `, ${userData.area}` : ''}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-adm-muted">
                <Calendar size={12} /> Joined {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            {userData.bio && (
              <p className="text-xs text-adm-muted mt-4 border-t border-adm-border pt-4 leading-relaxed">{userData.bio}</p>
            )}
          </div>

          {/* Recent Conversations */}
          {userConversations && userConversations.length > 0 && (
            <div className="bg-adm-surface border border-adm-border overflow-hidden">
              <div className="px-4 py-3 border-b border-adm-border">
                <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider">Recent Conversations</h3>
              </div>
              <div className="divide-y divide-adm-border">
                {userConversations.map((c: any) => (
                  <div key={c.id} className="px-4 py-3">
                    <p className="text-xs font-medium text-adm-text truncate">{(c.properties as any)?.title ?? 'No property'}</p>
                    {c.last_message_preview && (
                      <p className="text-[11px] text-adm-muted mt-0.5 truncate">{c.last_message_preview}</p>
                    )}
                    <p className="text-[10px] text-adm-faint mt-1">
                      {new Date(c.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function Page({ params }: PageProps) {
  const { isAdmin } = await checkIsAdmin()
  if (!isAdmin) redirect('/unauthorized')
  const { id } = await params

  return (
    <Suspense fallback={<div className="animate-pulse text-adm-muted px-6 py-8">Loading user...</div>}>
      <UserDetails userId={id} />
    </Suspense>
  )
}
