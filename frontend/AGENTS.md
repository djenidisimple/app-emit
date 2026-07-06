<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Progress Log — Hubstaff-inspired Top-Nav Dashboard Design

## Layout Architecture
- **TopNavbar.tsx**: Fixed horizontal navbar at viewport top (h-14, z-50). Left: hamburger menu toggler, logo (GS badge + "G-Salles"), page title. Right: search, notifications (bell with unread badge), apps grid icon, user avatar (initials + green online dot) with dropdown chevron.
- **Sidebar.tsx**: Slim sidebar (collapsible: w-14 collapsed, w-56 expanded) below top navbar. Indigo active state with left border bar (3px), light indigo bg (#F0F1FF). Supports nested children (e.g., Planning > EDT Globale, Mes séances). Toggle via hamburger in TopNavbar.
- **ProtectedLayout.tsx**: Flex column layout: TopNavbar fixed top → flex row of [SlimSidebar | main content]. Content area has bg-bg-secondary (#F7F8FA) with p-5 padding.

## Color Palette (defined in globals.css via `@theme inline`)
- **Primary accent**: #4F5EFF (indigo/blue-purple) — active states, primary buttons, selected filters
- **Secondary future**: #3B82F6 (light blue) — future/upcoming blocks
- **Late/warning**: #F59E0B (orange/amber) — late status badges
- **Danger**: #EF4444 (red) — missed/cancelled indicators
- **Success**: #10B981 (green) — confirmed/completed
- **Special**: #8B5CF6 (violet) — special statuses
- **Neutrals**: #FFFFFF bg, #F7F8FA secondary bg, #F3F4F6 tertiary, #E5E7EB borders, #1F2937 text, #6B7280 secondary text, #9CA3AF tertiary

## Typography
- **Font**: Inter (variable), loaded in layout.tsx via `next/font/google`
- Page titles: `text-base font-semibold` (16px)
- Section headers: `text-xs font-semibold uppercase tracking-wider`
- Body: `text-sm` (14px) or `text-xs` (12px)

## Component Design Tokens

### Buttons (Button.tsx)
- Sizes: sm (8px rounded), md/lg (12px rounded)
- Primary: `bg-accent text-white hover:bg-accent-dark shadow-sm hover:shadow-md`
- Secondary: `bg-white text-text border border-border hover:bg-bg-tertiary`
- Success: `bg-success text-white hover:bg-emerald-600`
- Danger: `bg-danger text-white hover:bg-red-700`
- Outline/ghost exist

### Inputs (Input.tsx)
- `rounded-xl` (12px), white bg, border-border, 10-12px padding
- Focus: `focus:border-accent focus:ring-2 focus:ring-accent/20`
- Labels: `text-xs font-medium text-text-secondary`
- Error: red border + glow

### Badge/Badge.tsx
- Pill-style with colored dot indicator + text
- Confirmed: green bg + dot, Cancelled: gray, Late/En attente: amber, Terminé: violet

### Cards (used throughout pages)
- White bg, `border border-border`, `rounded-xl` (12px), shadow-card (subtle)
- Internal padding 16-24px

### FilterBar.tsx
- `rounded-xl` container, `shadow-card`
- Filter toggle button: `bg-accent text-white` active, `bg-bg-tertiary text-text-secondary` inactive
- Sort select: bordered dropdown with chevron

### Filters & Toggles
- View toggle (List/Calendar): pill-style group in a border container, active item is `bg-accent text-white` with overflow-hidden
- Show/hide toggle: standard `bg-accent` when active, `bg-gray-200` when inactive

## Semantic color classes preserved
- ROLE_COLORS: Admin (red), Professeur (blue), Etudiant (green), Responsable (purple) — kept for role differentiation
- Avatar color palette: diverse colors for user avatars — kept
- PDF export inline CSS: updated to use accent color (#3B82F6)

## Key files
- `app/globals.css` — all design tokens
- `app/layout.tsx` — Inter font, NotificationProvider
- `components/layout/TopNavbar.tsx` — top nav bar
- `components/layout/Sidebar.tsx` — slim sidebar
- `components/layout/ProtectedLayout.tsx` — layout wrapper
- `components/ui/Button.tsx`, `Input.tsx`, `Badge.tsx` — UI primitives
- `components/FilterBar.tsx`, `CalendarWeek.tsx` — feature components
