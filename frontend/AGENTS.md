<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Progress Log — Neo-brutalism → Modern blue/rounded theme

## Completed (all 100% done)
- Rewrote **Sidebar.tsx** — dark → light blue, rounded, white bg, blue active states
- Rewrote **Topbar.tsx** — removed nav links, light blue, rounded
- Created **`/interface` page** — full demo with calendar/rooms/modal/components all light/blue/rounded
- Renamed route: `/neo-brutalism` → `/interface`
- Cleaned **globals.css** — removed all nb-* utilities, tricolor palette
- Updated **dashboard/page.tsx** — StatCards, tables, modals, toasts, filters, view toggle, SortBtn, loading/empty states
- Updated **planning/page.tsx** — nav bar, table, legend, cards, error banners
- Updated **notifications/page.tsx** — stat cards, buttons, error, notification items
- Updated **salles/page.tsx** — search, stats, cards, skyline
- Updated **admin/page.tsx** — all nav cards
- Updated **admin/filieres/page.tsx** — full rewrite
- Updated **admin/niveaux/page.tsx** — full rewrite
- Updated **admin/parcours/page.tsx** — full rewrite
- Updated **admin/matieres/page.tsx** — full rewrite
- Updated **admin/reservations/page.tsx** — batch replace gray → blue
- Updated **admin/salles/page.tsx** — batch replace gray → blue
- Updated **admin/utilisateurs/page.tsx** — batch replace gray → blue
- Updated **admin/generateur-seance/page.tsx** — link colors
- Updated **GenerateurSeanceForm.tsx** — full rewrite (blue/rounded)
- Updated **login/page.tsx** — full rewrite (blue/rounded)
- Updated **register/page.tsx** — full rewrite (blue/rounded)
- Updated **page.tsx** (landing) — full rewrite (blue/rounded)
- Updated **about/page.tsx** — full rewrite (blue/rounded)
- Updated **SalleCard.tsx** — blue theme, rounded
- Updated **SeanceCard.tsx** — blue theme, rounded
- Updated **CalendarWeek.tsx** — blue theme, rounded
- Updated **FilterBar.tsx** — blue theme, rounded
- Updated **ReservationModal.tsx** — blue theme, rounded
- Updated **ExceptionModal.tsx** — blue theme, rounded
- Updated **EmptyState.tsx** — blue theme, rounded
- Updated **LoadingSkeleton.tsx** — blue theme, rounded
- Updated **Button.tsx** — blue theme, rounded
- Updated **Input.tsx** — blue theme, rounded
- Updated **Badge.tsx** — blue theme, rounded

## Remaining (nothing)
- No `border-ink`, `shadow-hard`, `bg-midnight`, or `text-ink` remain in any `.tsx` file
- 0 occurrences of these patterns across the entire frontend

## Patterns
- `rounded-2xl` / `rounded-xl` / `rounded-lg` instead of `rounded-none` or `border-2 border-ink`
- `border border-blue-100` / `border-blue-200` instead of `border-2 border-ink`
- `shadow-sm` / `shadow-lg` instead of `shadow-hard` / `shadow-hard-sm` / `shadow-hard-lg`
- `bg-blue-50` instead of `bg-canvas` / `bg-[#F8F9FA]` / `bg-midnight`
- `text-blue-900` / `text-blue-500` / `text-blue-400` instead of `text-ink` / `text-muted`
- `hover:bg-blue-50` instead of `hover:bg-canvas` / `hover:bg-[#F8F9FA]`
- `bg-[#0052FF]` instead of `bg-primary` / `bg-[#1B3A6B]`
- `focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF]` for input focus states
