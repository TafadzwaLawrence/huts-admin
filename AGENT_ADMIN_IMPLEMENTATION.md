# Agents System — Full Implementation Guide

> Covers the complete agents feature: database, signup wizard, agent portal, public profile, admin management, and email.
> Built for the Huts Zimbabwe property platform (Next.js 14 App Router + Supabase).

---

## 1. File Structure

```
app/
├── agents/signup/page.tsx          ← Public signup wizard (5-step, client component)
├── agent/
│   ├── [slug]/page.tsx             ← Public agent profile page (server component)
│   └── (portal)/
│       ├── layout.tsx              ← Portal auth guard + AgentNavbar
│       ├── overview/page.tsx       ← Agent dashboard (server component)
│       ├── leads/                  ← Lead management
│       ├── clients/                ← Client CRM
│       ├── transactions/           ← Transaction tracker
│       ├── commissions/            ← Commission tracker
│       ├── calendar/               ← Appointments
│       ├── messages/page.tsx       ← Re-exports dashboard messages page
│       └── profile/page.tsx        ← Re-exports dashboard/agent-profile page ❌ (needs own page)
├── admin/agents/
│   ├── page.tsx                    ← Admin agent list (server component)
│   └── [id]/
│       ├── page.tsx                ← Admin agent detail (server component)
│       └── AdminAgentActions.tsx   ← Action buttons (client component)
└── api/admin/agents/[id]/route.ts  ← PATCH / DELETE API

components/
├── layout/AgentNavbar.tsx          ← Portal top nav
└── ui/PhoneInput.tsx               ← Phone input with country dial code

emails/
└── AgentVerificationEmail.tsx      ← Sent on approval / verification badge

supabase/migrations/
└── 037_agents_clean_setup.sql      ← ⚠️ MUST BE RUN FIRST in Supabase SQL Editor
```

---

## 2. Database — Run Migration 037 First

**File:** `supabase/migrations/037_agents_clean_setup.sql`
**Run in:** Supabase SQL Editor (Dashboard → SQL Editor → paste and run)

### What it does
1. Adds `status TEXT NOT NULL DEFAULT 'pending'` to `agents` if missing
2. Adds `featured BOOLEAN NOT NULL DEFAULT FALSE` to `agents` if missing
3. Backfills existing rows: `is_active = true → status = 'active'`
4. Adds `CHECK (status IN ('pending','active','suspended','inactive'))` constraint
5. Fixes `agent_service_areas.agent_id` FK → `agents(id) ON DELETE CASCADE`
6. Fixes `agent_reviews.agent_id` FK → `agents(id) ON DELETE CASCADE`
7. Drops old `agent_profiles` TABLE or VIEW (whichever exists), recreates as `VIEW agent_profiles AS SELECT * FROM agents`
8. Creates indexes: `agents(status)`, `agents(featured)`, `agents(slug)`

### Success confirmation
The final query returns one row:
```
total_agents | pending | active | status_col_exists | result
      3      |    2    |   1    |      status       | Setup complete
```

---

## 3. `agents` Table Schema

```sql
id                UUID        PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID        REFERENCES profiles(id) ON DELETE CASCADE
agent_type        TEXT        -- see Agent Types below
business_name     TEXT
bio               TEXT
phone             TEXT        -- stored as full international: e.g. +2637XXXXXXXX
whatsapp          TEXT
office_address    TEXT
office_city       TEXT
years_experience  INTEGER
license_number    TEXT
website           TEXT
languages         TEXT[]      -- e.g. ['English', 'Shona']
specializations   TEXT[]      -- see Specializations below
slug              TEXT UNIQUE
profile_image_url TEXT        -- Uploadthing CDN URL
verified          BOOLEAN     DEFAULT FALSE
verification_date TIMESTAMPTZ
is_active         BOOLEAN     DEFAULT TRUE  -- legacy column, use status instead
is_premier        BOOLEAN     DEFAULT FALSE -- premium tier
status            TEXT        NOT NULL DEFAULT 'pending'
                              -- CHECK: pending | active | suspended | inactive
featured          BOOLEAN     NOT NULL DEFAULT FALSE
avg_rating        NUMERIC(3,2)
total_reviews     INTEGER DEFAULT 0
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

### `agent_service_areas` table
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
agent_id   UUID REFERENCES agents(id) ON DELETE CASCADE
city       TEXT NOT NULL
is_primary BOOLEAN DEFAULT FALSE
```

### Agent Types (`lib/constants.ts`)
```typescript
import { AGENT_TYPE_LABELS } from '@/lib/constants'
// Keys:
'real_estate_agent'  → 'Real Estate Agent'
'property_manager'   → 'Property Manager'
'home_builder'       → 'Home Builder'
'photographer'       → 'Real Estate Photographer'
'other'              → 'Other Professional'
```

### Specializations (`lib/constants.ts`)
```typescript
import { AGENT_SPECIALIZATION_LABELS } from '@/lib/constants'
// Keys: luxury_homes, first_time_buyers, commercial, investment,
//       student_housing, rental_management, affordable_housing,
//       new_construction, foreclosures, land_sales, vacation_rentals, senior_living
```

---

## 4. Signup Wizard — `app/agents/signup/page.tsx`

**Type:** `'use client'` — single file, wraps inner component in `<Suspense>` (required for `useSearchParams`).

### Step flow
```
Step 0  — Account creation (email/password or Google OAuth)
          Only shown when user is NOT authenticated.
          On auth complete → onAuthStateChange fires → advances to Step 1.

Step 1  — Agent type selection (5 cards: real_estate_agent, property_manager,
          home_builder, photographer, other)

Step 2  — Basic info: business_name, phone (PhoneInput), whatsapp (PhoneInput),
          office_address (LocationPicker map), office_city (required)

Step 3  — Professional details: license_number, years_experience, certifications

Step 4  — Service areas: multi-select cities from ZIMBABWE_CITIES constant (min 1 required)

Step 5  — Profile content: bio (required), specializations (multi-select), languages
```

### `handleSubmit` — what it inserts
```typescript
// 1. Update profiles table
await supabase.from('profiles').update({
  role: 'agent',
  phone: `${formData.phone_dial}${formData.phone}`,
  city: formData.office_city,
  bio: formData.bio,
}).eq('id', user.id)

// 2. Insert into agents table
const { data: agentProfile } = await supabase.from('agents').insert({
  user_id: user.id,
  agent_type: formData.agent_type,
  business_name: formData.business_name || null,
  phone: `${formData.phone_dial}${formData.phone}`,
  whatsapp: `${formData.whatsapp_dial}${formData.whatsapp}`,
  office_address: formData.office_address || null,
  office_city: formData.office_city,
  license_number: formData.license_number || null,
  bio: formData.bio,
  specializations: formData.specializations,
  // status defaults to 'pending' — admin must approve
}).select().single()

// 3. Insert service areas
await supabase.from('agent_service_areas').insert(
  formData.service_areas.map(city => ({ agent_id: agentProfile.id, city }))
)

// 4. Redirect
router.push('/dashboard/overview')
```

### ⚠️ Known gap: role upgrade not persisted
The `profiles.update({ role: 'agent' })` call runs client-side with the anon key. If RLS blocks it, `profiles.role` may stay as `'renter'` and the agent portal layout will redirect back to `/agents/signup`.

**Fix:** Call a Postgres function instead:
```typescript
await supabase.rpc('fn_upgrade_to_agent', { p_user_id: user.id })
```
Or ensure RLS on `profiles` allows users to update their own `role` column.

### After submit
Agent record has `status = 'pending'`. Admin must approve it (`status → 'active'`) before:
- The agent portal becomes accessible (layout checks for `agents` row but doesn't check `status`)
- The public profile is visible (`/agent/[slug]` only shows `status = 'active'`)

---

## 5. Agent Portal — `app/agent/(portal)/`

### Layout — `app/agent/(portal)/layout.tsx`

**Type:** Server Component.

Auth logic:
1. `createClient()` → `getUser()` — redirect to `/auth/signup` if no session
2. Query `profiles` for `full_name, role, avatar_url`
3. Query `agents` for `id, is_premier` where `user_id = user.id`
4. If no `agents` row found → redirect to `/agents/signup`

Renders `AgentNavbar` with `user`, `profile`, `agentId`, `isPremier` props.

### AgentNavbar — `components/layout/AgentNavbar.tsx`

**Type:** `'use client'`

Nav links (in order):
```
/agent/overview      Overview        LayoutDashboard
/agent/leads         Leads           Inbox  (+ count badge from `leads` table)
/agent/transactions  Transactions    FileText
/agent/clients       Clients         Users
/agent/messages      Messages        MessageSquare
/agent/calendar      Calendar        Calendar
/agent/profile       My Profile      User
```

New lead count badge: queries `leads` table where `assigned_to = agentId` and `status IN ('assigned','new')`. Updates in real-time via Supabase channel subscription.

### Portal Pages

| Route | File | Status |
|-------|------|--------|
| `/agent/overview` | `app/agent/(portal)/overview/page.tsx` | ✅ Server component, shows stat cards + recent leads |
| `/agent/leads` | `app/agent/(portal)/leads/` | ✅ Exists |
| `/agent/transactions` | `app/agent/(portal)/transactions/` | ✅ Exists |
| `/agent/clients` | `app/agent/(portal)/clients/` | ✅ Exists |
| `/agent/commissions` | `app/agent/(portal)/commissions/` | ✅ Exists |
| `/agent/calendar` | `app/agent/(portal)/calendar/` | ✅ Exists |
| `/agent/messages` | `app/agent/(portal)/messages/page.tsx` | ✅ Re-exports dashboard messages page |
| `/agent/profile` | `app/agent/(portal)/profile/page.tsx` | ❌ Re-exports landlord profile page — needs own form |

---

## 6. Public Agent Profile — `app/agent/[slug]/page.tsx`

**Type:** Server Component.

### Access control
Only renders `status = 'active'` agents. Any other status → `notFound()`.

### Slug resolution
```typescript
// 1. Try slug
SELECT * FROM agents WHERE slug = $1 AND status = 'active'

// 2. Fall back to user_id (legacy links before slugs existed)
SELECT * FROM agents WHERE user_id = $1 AND status = 'active'
```

### Data fetched
```typescript
supabase.from('agents').select(`
  *,
  profiles:user_id (full_name, email, avatar_url),
  agent_service_areas (city, is_primary)
`)
```

### Contact CTA priority
1. WhatsApp (`https://wa.me/[whatsapp]`) if `agent.whatsapp` is set
2. Phone call (`tel:[phone]`) if `agent.phone` is set
3. Email (`mailto:[profile.email]`) as fallback

### SEO (`generateMetadata`)
```typescript
{
  title: `${name} — ${typeLabel} in Zimbabwe | Huts`,
  description: agent.bio?.slice(0, 155) || `Connect with ${name}, a verified ${typeLabel} on Huts Zimbabwe.`
}
```

---

## 7. Admin Agent Management

### Supabase client rule — CRITICAL
```typescript
// Auth check only:
const supabase = await createClient()                    // reads cookie session
const { data: { user } } = await supabase.auth.getUser()

// ALL database reads and writes in admin:
const admin = createAdminClient()                        // service role, bypasses RLS
// Note: createAdminClient() is synchronous — no await
```
Using `createClient()` for DB queries in admin will hide `pending`/`suspended` agents due to RLS.

---

### Admin Agent List — `app/admin/agents/page.tsx`

**Type:** Server Component. Receives `searchParams: { status?: string }`.

**Default tab:** `pending`

**Tabs with count badges:** `pending | active | suspended | inactive`

**Query:**
```typescript
const supabase = createAdminClient()
const { data: agents } = await supabase
  .from('agents')
  .select(`
    id, user_id, agent_type, business_name, office_city,
    phone, verified, status, featured, avg_rating, total_reviews,
    created_at, slug,
    profiles:user_id (full_name, email, avatar_url)
  `)
  .eq('status', statusFilter)
  .order('created_at', { ascending: false })
```

**Table columns:** Agent name+email, Type (with icon), City, Rating, Verified, Submitted date, "Review →" button

**Status badge styles:**
```typescript
pending:   'bg-amber-50 text-amber-700 border border-amber-200'
active:    'bg-green-50 text-green-700 border border-green-200'
suspended: 'bg-red-50 text-red-700 border border-red-200'
inactive:  'bg-gray-100 text-gray-600 border border-gray-200'
```

---

### Admin Agent Detail — `app/admin/agents/[id]/page.tsx`

**Type:** Server Component.

**Query:**
```typescript
const { data: agent } = await supabase
  .from('agents')
  .select(`
    *,
    profiles:user_id (full_name, email, avatar_url, created_at),
    agent_service_areas (city, is_primary)
  `)
  .eq('id', params.id)
  .single()
```

**⚠️ Do NOT join `agent_reviews`** — the FK may be dangling before migration 037 is run. Use the denormalized `agent.avg_rating` and `agent.total_reviews` columns instead.

**Layout:** 2-column grid:
- Left (2/3): profile card (avatar initial, name, type, email, status+verified+featured badges), bio, professional details grid (experience, license, phone, city, member since, reviews), service areas (primary in black pill, others in gray), specializations, languages
- Right (1/3): `AdminAgentActions` component

---

### AdminAgentActions — `app/admin/agents/[id]/AdminAgentActions.tsx`

**Type:** `'use client'`

**Props:**
```typescript
{
  agentId:         string
  currentStatus:   'pending' | 'active' | 'suspended' | 'inactive'
  currentVerified: boolean
  currentFeatured: boolean
  agentSlug:       string | null
}
```

**Buttons and what they send to `PATCH /api/admin/agents/[agentId]`:**

| Button | Payload | Visible when |
|--------|---------|--------------|
| Approve Agent | `{ status: 'active' }` | status !== 'active' |
| Suspend Agent | `{ status: 'suspended' }` | status !== 'suspended' |
| Reactivate Agent | `{ status: 'active' }` | status === 'suspended' |
| Mark as Verified | `{ verified: true }` | !currentVerified |
| Remove Verification | `{ verified: false }` | currentVerified |
| Mark as Featured | `{ featured: true }` | !currentFeatured |
| Remove Featured | `{ featured: false }` | currentFeatured |
| View Public Profile | link → `/agent/[slug]` | agentSlug != null |
| Delete Agent | `DELETE /api/admin/agents/[agentId]` | always |

After each action: `toast.success()` + `router.refresh()` (re-renders the server component).

---

### Admin PATCH/DELETE API — `app/api/admin/agents/[id]/route.ts`

**PATCH — allowed body fields (whitelist enforced):**
```typescript
{ status: 'pending' | 'active' | 'suspended' | 'inactive' }
{ verified: boolean }       // also sets verification_date when true
{ featured: boolean }
```

**On `status → 'active'` OR `verified → true`:** Sends `AgentVerificationEmail` via Resend. Non-fatal — email errors are logged but don't fail the update.

**DELETE:** Hard deletes the `agents` row. Cascade handles `agent_service_areas`.

**Auth pattern in every route:**
```typescript
// 1. session check
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com').split(',').map(e => e.trim())
if (!ADMIN_EMAILS.includes(user.email || '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// 2. db write — service role
const adminDb = createAdminClient()
await adminDb.from('agents').update({ ...fields }).eq('id', params.id)
```

---

## 8. Verification Email — `emails/AgentVerificationEmail.tsx`

Sent by `app/api/admin/agents/[id]/route.ts` on PATCH.

**Props:**
```typescript
{
  agentName:  string               // business_name || full_name
  agentType:  string               // human label, e.g. 'Real Estate Agent'
  profileUrl: string               // https://huts.co.zw/agent/[slug]
  portalUrl:  string               // https://huts.co.zw/agent/overview
  action:     'approved' | 'verified'
}
```

**Subject lines:**
- `approved` → `"Your Huts agent profile is now live, ${agentName}!"`
- `verified` → `"You've been verified on Huts, ${agentName}!"`

---

## 9. Pending Work ❌

### 9.1 Role upgrade fix (BLOCKER for portal access)
The `handleSubmit` in `app/agents/signup/page.tsx` calls:
```typescript
await supabase.from('profiles').update({ role: 'agent' }).eq('id', user.id)
```
If RLS blocks this (user can't update their own role), the portal layout redirects back to signup.

**Fix:** Replace with an RPC call that runs as `SECURITY DEFINER`:
```typescript
await supabase.rpc('fn_upgrade_to_agent', { p_user_id: user.id })
```
Migration needed:
```sql
CREATE OR REPLACE FUNCTION fn_upgrade_to_agent(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET role = 'agent' WHERE id = p_user_id;
END;
$$;
```

### 9.2 Agent edit profile page
`app/agent/(portal)/profile/page.tsx` is `export { default } from '@/app/dashboard/agent-profile/page'` — it points to the wrong page.

Needs a dedicated form with fields:
- `business_name`, `bio`, `phone`, `office_city`
- `years_experience`, `license_number`, `website`
- `languages[]`, `specializations[]`
- Profile photo upload (Uploadthing → store URL in `agents.profile_image_url`)

API route needed: `PATCH /api/agent/profile`
```typescript
// Auth: createClient() → getUser()
// DB write: update agents SET ... WHERE user_id = user.id
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('agents').update({ ...fields }).eq('user_id', user.id)
```

### 9.3 Service areas not set as primary
The signup inserts service areas but never sets `is_primary = true`. The public profile shows a "primary" badge — it will never appear for newly signed-up agents.

**Fix:** In `handleSubmit`, mark `formData.primary_service_area` as primary:
```typescript
formData.service_areas.map(city => ({
  agent_id: agentProfile.id,
  city,
  is_primary: city === formData.primary_service_area,
}))
```

### 9.4 Admin overview — agent stats missing
`app/admin/page.tsx` does not show agent pending count. Add to the `Promise.all`:
```typescript
admin.from('agents').select('*', { count: 'exact', head: true }),
admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
```
And add an alert banner (same pattern as the pending properties banner) linking to `/admin/agents?status=pending`.

### 9.5 `/find-agent` public page
Page to browse active agents by city, type, and specialization. Does not exist yet.

Query (public page — use `createClient()` not admin client, RLS shows only `status='active'`):
```typescript
supabase.from('agents')
  .select(`*, profiles:user_id (full_name, avatar_url), agent_service_areas (city, is_primary)`)
  .eq('status', 'active')
  .order('featured', { ascending: false })
  .order('avg_rating', { ascending: false, nullsFirst: false })
```

---

## 10. Key Constants Reference

All from `lib/constants.ts`, import as:
```typescript
import {
  AGENT_TYPE_LABELS,
  AGENT_SPECIALIZATIONS,
  AGENT_SPECIALIZATION_LABELS,
  ZIMBABWE_CITIES,
  LANGUAGES,
  ICON_SIZES,
} from '@/lib/constants'
```

**Colors (Tailwind hex values):**
```
#212529  charcoal    ← primary text, black buttons, status active bg on agent
#495057  dark-gray   ← secondary text
#ADB5BD  medium-gray ← muted/placeholder text
#E9ECEF  light-gray  ← borders
#F8F9FA  off-white   ← card backgrounds, table row hover
#51CF66  green       ← verified/active state
#FF6B6B  red         ← suspended/destructive
```
