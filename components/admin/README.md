# Admin Components

Reusable components for the admin panel. These components follow the Huts B&W design system with admin-specific styling.

## Components

### Layout Components
- **AdminHeader** - Top bar with navigation and user info
- **AdminPageHeader** - Page header with title, description, and action buttons
- **AdminBreadcrumbs** - Navigation breadcrumb trail

### Data Display
- **AdminTable** - Configurable data table with sorting, filtering, pagination
- **AdminStatCard** - Dashboard metric cards
- **AdminBadge** - Status badges (approved/pending/rejected/etc)
- **AdminEmptyState** - Empty state UI for tables and lists

### Actions
- **AdminActionButtons** - Action button patterns (approve, reject, delete, edit)

## Design Principles

- **B&W Focus**: 95% black & white, 5% color for necessities (status, alerts)
- **Consistent**: All components use charcoal (#212529) for headers, light gray (#F9FAFB) for backgrounds
- **Accessible**: Proper focus states, ARIA labels, keyboard navigation
- **Responsive**: Works on desktop and tablet (admin is primarily desktop-focused)

## Usage

```tsx
import { AdminStatCard, AdminTable, AdminBadge } from '@/components/admin'

// Use in admin pages
<AdminStatCard label="Total Users" value={1234} icon={Users} />
```
