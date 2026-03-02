# Search/Discover Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the `/search` page into a minimalist, fully responsive Search/Discover experience with a poster grid and a Search/Discover toggle.

**Architecture:** Implement a single client-side React page at `app/(main)/search/page.tsx` that manages a Search/Discover tab state, calls the existing TMDB search API, and renders poster-grid-based search results plus static Discover sections (hooked up to existing TMDB endpoints if desired later). Reuse the existing `ShowCard` component or build a lightweight card specifically for grid display while keeping logic and styling simple and minimal.

**Tech Stack:** Next.js App Router, React, Tailwind CSS utility classes, existing TMDB API routes.

---

### Task 1: Update `/search` page structure to support tabs and layout

**Files:**
- Modify: `app/(main)/search/page.tsx`

**Steps:**
1. Change the page heading from "Search Shows" to "Discover shows" with a short muted subtitle.
2. Introduce local state for the active tab, e.g. `const [activeTab, setActiveTab] = useState<'search' | 'discover'>('search')`.
3. Wrap the page content in a container that supports a subtle dark gradient background and centered layout (e.g. `max-w-5xl mx-auto px-4 py-8`).
4. Add a simple top section containing the title, subtitle, and below it a centered segmented control component with two options: Search and Discover.
5. Ensure the `Search` tab is active by default and that clicking each tab updates `activeTab`.

### Task 2: Implement segmented control (Search/Discover toggle)

**Files:**
- Modify: `app/(main)/search/page.tsx`

**Steps:**
1. Implement a flex container for the toggle with two buttons styled as pills.
2. Apply active styles (solid background, subtle glow, text-white) when the button matches `activeTab`.
3. Apply inactive styles (transparent background, border, muted text) otherwise.
4. Make the control responsive but minimal (centered on small screens, left-aligned on larger if desired).
5. Verify visually in dev server that switching tabs only affects internal state for now.

### Task 3: Redesign the Search tab content

**Files:**
- Modify: `app/(main)/search/page.tsx`

**Steps:**
1. Keep the existing search logic and state (`query`, `results`, `loading`, `search` function) but adjust the input handler to avoid returning a cleanup function from `onChange` (fix debounce bug by using `setTimeout` with `useEffect` or a ref-based debounce, or temporarily remove debounce for simplicity).
2. Replace the current full-width input styling with a minimalist rounded search field: darker background, subtle border, left search icon if desired using a simple `span` or inline SVG.
3. Place the search field directly under the segmented control and make it full width on mobile and constrained by `max-w` on desktop.
4. Change the results layout from a vertical list using `ShowCard` to a responsive poster grid:
   - Use CSS grid with responsive columns, e.g. `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`.
   - For each result, render a new minimalist card: poster image, title, year, optional small rating chip.
5. Add empty-state messaging:
   - Before typing (query length < 2): show a centered hint like “Start typing to search TV shows”.
   - After typing with no results: show “No shows found for ‘{query}’”.
6. Ensure loading state appears as a small, subtle text under the search bar (e.g. “Searching…”).

### Task 4: Implement Discover tab sections with horizontal poster carousels

**Files:**
- Modify: `app/(main)/search/page.tsx`
- (Optional later) Add new API routes under `app/api/tmdb/` for popular/top-rated if not already present.

**Steps:**
1. For the first pass, implement Discover using static mock data or reusing a subset of the existing search results mapped into sections; keep the logic simple.
2. Create a `renderDiscover` section when `activeTab === 'discover'`.
3. Define 2–3 sections (e.g. “Popular this week”, “Highly rated”, “From your watchlist”).
4. For each section, render:
   - A header row with title on the left and a muted “View all” text link on the right (only visible on medium+ screens).
   - A horizontally scrollable row of poster cards using `overflow-x-auto` and a flex row of fixed-width cards.
5. Reuse the same minimalist poster card markup as the search grid for visual consistency.
6. Wrap sections in vertical spacing and keep typography minimal (no extra body text).

### Task 5: Make layout responsive and refine minimal styling

**Files:**
- Modify: `app/(main)/search/page.tsx`

**Steps:**
1. Ensure the outer container uses `max-w-5xl mx-auto px-4 py-8` and that internal sections use consistent vertical spacing.
2. Adjust typography so only 2–3 text sizes are used (title, subtitle, body).
3. Confirm that the search input and segmented control look good on both mobile (full width, stacked) and desktop (more horizontal space).
4. Validate that the grid and horizontal carousels respond correctly across breakpoints (2 columns on small, up to 5–6 on large screens).
5. Tweak colors and opacity of borders and backgrounds to keep a minimalist, cinematic feel without copying Letterboxd’s exact palette.

### Task 6: Clean up and lint

**Files:**
- Modify: `app/(main)/search/page.tsx`

**Steps:**
1. Run `npm run lint` (or `pnpm lint`/`yarn lint` depending on project) to check for errors.
2. Fix any straightforward lint issues introduced by the changes.
3. Manually sanity-check in the browser that:
   - Tabs switch correctly.
   - Search works as before.
   - Results appear in a poster grid.
   - Discover tab displays sections with horizontal scrolling.

