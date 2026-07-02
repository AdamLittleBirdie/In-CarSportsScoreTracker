# Plan: In-Car Sports Score Tracker

## Context
Build a multi-screen React app simulating an in-car sports score tracking experience that pairs with Android Auto / Apple CarPlay. The product spans two environments — a mobile configuration app and a driving-mode in-car display — both rendered in a single React demo with state-based navigation. The core challenge is balancing information density with road-safety-first readability.

---

## Aesthetic Stance

**Swiss + Data-Dense** applied to a dark cockpit ground.

- **Ground**: Near-black `#070a0f` — like a switched-off instrument cluster
- **Accent**: Signal amber `#f5a623` — motorsport readability, not blue SaaS
- **Secondary accent**: Electric green `#00e57a` for "live" / active states
- **Danger/loss**: Warm red `#e5352a`
- **Type hierarchy**:
  - Display: **Barlow Condensed** (700/800) — tight, sporty, high-contrast caps
  - Body/UI: **Barlow** (400/600) — readable, Swiss, same family for coherence
  - Data labels / scores: **DM Mono** — tabular digits, clean numeric alignment
- **Radius**: tight (`0.375rem`) — functional, not rounded-card SaaS
- **Layout**: CSS Grid page-level, Flexbox component-level. Asymmetric compositions in the mobile app; single-column maximum-size text in the driving view.

---

## Screens & Navigation

Single-page app with a `currentScreen` state string driving a `switch` render. Screens:

1. **`splash`** — 2-second auto-advance to `home`; animated logo mark, app name
2. **`home`** — Mobile nav bar + sport tiles (AFL, NRL, Cricket, Football); each tile shows a live score teaser
3. **`sports-selection`** — Toggle leagues on/off; expandable team pickers per league; Save button
4. **`stats-config`** — Per-sport stat toggles + sort order; in-car preview mockup panel
5. **`settings`** — Refresh interval, display preferences, account section
6. **`carplay`** — The in-car driving display: full-screen, carousel-based, large score card

Navigation: bottom nav bar on mobile screens (home / sports / stats / settings); a prominent "Drive Mode" button on the home screen launches `carplay`. In carplay, a small exit button returns to home.

---

## File Changes

### `src/styles/fonts.css`
Add Google Fonts import:
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
```

### `src/styles/theme.css`
Update `:root` tokens only — preserve `.dark` block and `@theme inline` mapping:
- `--background`: `#070a0f`
- `--foreground`: `#f0f2f5`
- `--card`: `#0e1319`
- `--card-foreground`: `#f0f2f5`
- `--primary`: `#f5a623` (amber)
- `--primary-foreground`: `#070a0f`
- `--secondary`: `#131c26`
- `--secondary-foreground`: `#a0aab8`
- `--muted`: `#131c26`
- `--muted-foreground`: `#5a6578`
- `--accent`: `#00e57a` (green = live)
- `--accent-foreground`: `#070a0f`
- `--border`: `rgba(255,255,255,0.08)`
- `--ring`: `#f5a623`
- `--radius`: `0.375rem`
- `--font-weight-medium`: `600`

### `src/app/App.tsx`
Complete replacement with the full multi-screen app. Key sections:

**State**: `currentScreen`, `selectedSports` (AFL/NRL/Cricket/Football toggles), `selectedTeams`, `carouselIndex` (auto-advances every 15s in carplay), `currentTime`.

**Mock data** (realistic):
- AFL: Collingwood 87 – GWS Giants 74 (Q3 12:34)
- NRL: Melbourne Storm 18 – Penrith Panthers 12 (60')
- Cricket: Australia 312/6 – England 287 all out
- Football: Manchester City 2 – Arsenal 1 (78')
- Standings rows per league

**SplashScreen**: Full-screen dark, centered app name "SCOREDRIVE" in Barlow Condensed 800, amber accent, animated pulse ring, auto-advance via `useEffect` + `setTimeout(1800)`.

**HomeScreen**:
- Top bar: app name + drive mode button (amber pill)
- Sport tiles in a 2×2 grid: each shows sport name, active league count, and a score teaser line
- Bottom nav: Sports / Stats / Settings icons

**SportsSelectionScreen**:
- List of leagues with toggle switches; each league expands to show team checkboxes
- Sticky bottom save bar

**StatsConfigScreen**:
- Left column: toggleable stat list per sport tab
- Right column: in-car preview card (mini version of the carplay display)

**SettingsScreen**:
- Refresh interval selector (15s / 30s / 60s)
- Font size toggle (Normal / Large)
- Account section with sign-out

**CarplayScreen** (driving mode):
- Full black background, no nav chrome
- Large score card: Team A name (Barlow Condensed 72px-equivalent), score in DM Mono (96px-equivalent), vs divider, Team B name + score
- Match time badge + sport badge
- Dot indicators for carousel position
- "LIVE" green pill
- Auto-carousel every 15s via `useInterval`
- Swipe hint text at bottom
- Stats strip: 3 stats in a bottom panel (Barlow Condensed labels, DM Mono values)
- Small amber exit button (top-right corner, small and unobtrusive)

---

## Implementation Notes

- Use `useState` + `useEffect` for carousel auto-advance; clear interval on unmount
- Swipe handling on carplay view: `onTouchStart` / `onTouchEnd` delta to advance carousel
- All sport icons: lucide-react (`Trophy`, `Zap`, `Activity`, `Globe`) — no copyrighted logos
- Status icons: `Radio` for live, `Clock` for upcoming, `CheckCircle` for finished
- Animate screen transitions with a simple CSS fade (`transition-opacity`)
- The carplay screen uses `min-h-screen` and forces dark ground regardless of theme
- Preview panel in StatsConfig uses `scale-75 origin-top` on a mock carplay card

---

## Verification

1. App loads → splash auto-advances to home after ~1.8s
2. "Drive Mode" button on home → carplay screen renders with large score text
3. Carplay carousel auto-advances every 15s; dots update
4. Back arrow returns to home
5. Sports selection toggles persist in state; Stats config shows preview update
6. All screens reachable via bottom nav
7. No console errors; all JSX closed; no missing imports
