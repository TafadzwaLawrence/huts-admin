# Admin: Agent Verification & Activity Management

## Current State

| Surface | File | Status |
|---|---|---|
| Agent list (tabs) | `app/admin/agents/page.tsx` | ✅ Exists |
| Agent detail view | `app/admin/agents/[id]/page.tsx` | ✅ Exists |
| Agent PATCH/DELETE API | `app/api/admin/agents/[id]/route.ts` | ✅ Exists |
| `AdminAgentActions` component | `app/admin/agents/[id]/AdminAgentActions.tsx` | ❌ Missing |
| Bulk approve/reject | — | ❌ Missing |
| Verification email on approve/reject | — | ❌ Missing |
| Agent activity feed | — | ❌ Missing |
| Agent stats in admin dashboard | `app/api/admin/stats/route.ts` | Partial |

---

## Database

The admin queries the `agent_profiles` **view** (legacy name). The underlying table after migration `029` is **`agents`**.

### Key columns used by admin

```sql
-- agents table
user_id          UUID   -- FK to auth.users (also profiles.id)
agent_type       TEXT   -- real_estate_agent | property_manager | home_builder | photographer | other
business_name    TEXT
phone            TEXT
whatsapp         TEXT
office_address   TEXT
office_city      TEXT
license_number   TEXT
bio              TEXT
specializations  TEXT[]
languages        TEXT[]
verified         BOOLEAN DEFAULT false
verification_date TIMESTAMPTZ
status           TEXT    -- pending | active | suspended | inactive
is_active        BOOLEAN DEFAULT true
is_featured      BOOLEAN DEFAULT false
slug             TEXT UNIQUE
avg_rating       DECIMAL
total_reviews    INT
created_at       TIMESTAMPTZ
```

### View: `agent_profiles` (compatibility alias)

If `agent_profiles` view doesn't exist yet, create it:

```sql
CREATE OR REPLACE VIEW agent_profiles AS
SELECT * FROM agents;
```

Or update queries in `app/admin/agents/` to use `agents` directly.

---

## Step 1 — Create `AdminAgentActions.tsx`

**File:** `app/admin/agents/[id]/AdminAgentActions.tsx`

This is the right-column action panel on the agent detail page.

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ShieldX, ShieldCheck, Star, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  agentId: string
  currentStatus: string
  currentVerified: boolean
  currentFeatured: boolean
  agentSlug: string | null
}

export default function AdminAgentActions({
  agentId, currentStatus, currentVerified, currentFeatured, agentSlug,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const patch = async (body: object, successMsg: string) => {
    const action = JSON.stringify(body)
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(successMsg)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this agent profile? This cannot be undone.')) return
    setLoading('delete')
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success('Agent deleted')
      router.push('/admin/agents')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (key: string) => loading === key

  return (
    <div className="space-y-3">
      {/* Status actions */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Status</h3>

        {currentStatus !== 'active' && (
          <button
            onClick={() => patch({ status: 'active' }, 'Agent approved')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
          >
            {isLoading('{"status":"active"}') ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Approve
          </button>
        )}

        {currentStatus !== 'suspended' && (
          <button
            onClick={() => patch({ status: 'suspended' }, 'Agent suspended')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            {isLoading('{"status":"suspended"}') ? <Loader2 size={14} className="animate-spin" /> : <ShieldX size={14} />}
            Suspend
          </button>
        )}

        {currentStatus !== 'inactive' && (
          <button
            onClick={() => patch({ status: 'inactive' }, 'Agent deactivated')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#495057] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
          >
            Deactivate
          </button>
        )}
      </div>

      {/* Verification badge */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Verification</h3>
        <button
          onClick={() => patch(
            { verified: !currentVerified },
            currentVerified ? 'Verification removed' : 'Agent verified ✓',
          )}
          disabled={!!loading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
            currentVerified
              ? 'border-2 border-red-200 text-red-600 hover:border-red-400'
              : 'bg-green-50 border-2 border-green-200 text-green-700 hover:border-green-400'
          }`}
        >
          <ShieldCheck size={14} />
          {currentVerified ? 'Remove badge' : 'Grant verified badge'}
        </button>
      </div>

      {/* Featured */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#212529]">Featured</h3>
        <button
          onClick={() => patch(
            { featured: !currentFeatured },
            currentFeatured ? 'Removed from featured' : 'Agent featured',
          )}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] text-sm font-semibold rounded-xl hover:border-[#212529] disabled:opacity-50 transition-colors"
        >
          <Star size={14} className={currentFeatured ? 'fill-[#212529]' : ''} />
          {currentFeatured ? 'Unfeature' : 'Feature agent'}
        </button>
      </div>

      {/* External / danger */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 space-y-3">
        {agentSlug && (
          <a
            href={`/agent/${agentSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#495057] text-sm font-semibold rounded-xl hover:border-[#212529] hover:text-[#212529] transition-colors"
          >
            <ExternalLink size={14} /> View public profile
          </a>
        )}
        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-100 text-red-600 text-sm font-semibold rounded-xl hover:border-red-300 disabled:opacity-50 transition-colors"
        >
          {isLoading('delete') ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete agent
        </button>
      </div>
    </div>
  )
}
```

---

## Step 2 — Fix `agent_profiles` vs `agents` query mismatch

The admin list and detail pages query `agent_profiles`. After migration `029`, the table is `agents`. Either:

**Option A** — Create the view in Supabase SQL Editor:
```sql
CREATE OR REPLACE VIEW agent_profiles AS SELECT * FROM agents;
GRANT SELECT ON agent_profiles TO authenticated, anon;
```

**Option B** — Update the queries in the admin pages to use `agents` directly (search & replace `agent_profiles` → `agents` in `app/admin/agents/`).

---

## Step 3 — Verification Email on Approve/Reject

**File:** `emails/AgentVerificationEmail.tsx` (create using existing email templates as reference)
**Send from:** `app/api/admin/agents/[id]/route.ts` after status change

```ts
// In PATCH handler, after successful update:
if (allowed.status === 'active') {
  // fetch agent email from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', agentRow.user_id)
    .single()

  if (profile?.email) {
    await resend.emails.send({
      from: 'Huts <noreply@huts.co.zw>',
      to: profile.email,
      subject: 'Your agent profile is approved 🎉',
      react: AgentApprovedEmail({ name: profile.full_name || 'there' }),
    })
  }
}
```

---

## Step 4 — Bulk Actions on Agent List

The agent list page currently has no bulk select. Add using the existing `useAdminSelection` + `AdminBulkActions` pattern (already used in `app/admin/verification/page.tsx`).

Convert `app/admin/agents/page.tsx` from Server Component to `'use client'` or extract the table into a client sub-component.

**Bulk actions to support:**
- Approve all selected (set `status = 'active'`)
- Suspend all selected
- Delete all selected

**API endpoint:** `app/api/admin/bulk-actions/route.ts` already exists — add `agents` as a supported resource type.

---

## Step 5 — Agent Activity Feed (optional, future)

Query to power an activity tab on the agent detail page:

```sql
-- Agent's listings
SELECT id, title, status, created_at, 'property' AS type
FROM properties WHERE user_id = :agent_user_id

UNION ALL

-- Agent's received reviews  
SELECT r.id, r.comment_text AS title, r.status, r.created_at, 'review' AS type
FROM reviews r
JOIN properties p ON r.property_id = p.id
WHERE p.user_id = :agent_user_id

ORDER BY created_at DESC
LIMIT 20;
```

---

## Step 6 — Admin Stats: Pending Agents Count

Add to `app/api/admin/stats/route.ts`:

```ts
const { count: pendingAgents } = await supabase
  .from('agents')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'pending')
```

Surface in the admin overview dashboard as a "Needs review" badge next to the Agents nav link.

---

## Priority Order

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | Create `AdminAgentActions.tsx` | 1h | Unblocks all approve/reject flows |
| 2 | Fix `agent_profiles` view or update queries | 15min | Unblocks list + detail loading |
| 3 | Verification email on approve | 30min | Agent experience |
| 4 | Bulk actions on agent list | 1h | Admin efficiency |
| 5 | Pending count in dashboard nav | 15min | Admin awareness |
| 6 | Activity feed tab | 2h | Nice to have |
