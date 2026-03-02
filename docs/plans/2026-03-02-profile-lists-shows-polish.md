# Profile Fix, Editorial Lists, Streaming Sections, Early Community UX

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix blank profile pages, populate the app with editorial lists, add Netflix/HBO/Apple TV+/Prime streaming sections to the shows page, and add welcoming empty-state messaging for early users.

**Architecture:** All data fetching stays server-side. Profile trigger added to Supabase migration SQL. TMDB poster backfill happens server-side at render time (cached 24h). Streaming platform sections use TMDB `/discover/tv?with_networks=` endpoint. No new tables needed.

**Tech Stack:** Next.js 16 App Router, Supabase, TMDB API v3, Tailwind CSS v4, TypeScript

---

### Task 1: Add profile creation trigger to supabase-migration.sql

**Files:**
- Modify: `supabase-migration.sql`

**Step 1: Add the trigger SQL**

Append to the bottom of `supabase-migration.sql`:

```sql
-- 4. Profile auto-creation trigger
-- Fires when a new user signs up — creates their profiles row from auth metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO UPDATE
    SET username = COALESCE(excluded.username, profiles.username);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Step 2: Verify the file looks correct**

Read the file and confirm the trigger appears at the bottom after the storage policies section.

**Step 3: Commit**

```bash
git add supabase-migration.sql
git commit -m "fix: add handle_new_user trigger to create profile on signup"
```

---

### Task 2: Update supabase-seed.sql with 7 editorial lists

**Files:**
- Modify: `supabase-seed.sql`

**Step 1: Replace the entire seed file**

Replace `supabase-seed.sql` with this content:

```sql
-- trakr editorial seed data
-- Run this AFTER running supabase-migration.sql
-- Replace 'YOUR-USER-UUID' with your actual Supabase user ID
-- Find it at: Supabase Dashboard → Authentication → Users → copy UUID

DO $$
DECLARE
  user_uuid uuid := 'YOUR-USER-UUID'::uuid;
  list1_id  uuid;
  list2_id  uuid;
  list3_id  uuid;
  list4_id  uuid;
  list5_id  uuid;
  list6_id  uuid;
  list7_id  uuid;
BEGIN

  -- ──────────────────────────────────────────────
  -- List 1: Essential Crime TV
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Essential Crime TV', 'The definitive crime television watchlist. Morally complex, brilliantly written, impossible to stop watching.', true)
  RETURNING id INTO list1_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list1_id, 1396,  'Breaking Bad',      NULL, 1),
    (list1_id, 1438,  'The Wire',          NULL, 2),
    (list1_id, 1398,  'The Sopranos',      NULL, 3),
    (list1_id, 67744, 'Mindhunter',        NULL, 4),
    (list1_id, 69740, 'Ozark',             NULL, 5),
    (list1_id, 44778, 'True Detective',    NULL, 6),
    (list1_id, 46648, 'The Americans',     NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 2: Best Comedies Ever
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Best Comedies Ever', 'Shows that made us cry laughing. From dry British wit to absurdist American classics.', true)
  RETURNING id INTO list2_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list2_id, 1400,  'Seinfeld',                  NULL, 1),
    (list2_id, 2316,  'The Office',                NULL, 2),
    (list2_id, 2589,  'Arrested Development',      NULL, 3),
    (list2_id, 67188, 'Schitt''s Creek',            NULL, 4),
    (list2_id, 71712, 'What We Do in the Shadows',  NULL, 5),
    (list2_id, 67673, 'Fleabag',                   NULL, 6),
    (list2_id, 61240, 'Brooklyn Nine-Nine',         NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 3: Can't Stop Watching
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Can''t Stop Watching', 'Binge-worthy shows that made us cancel plans, miss sleep, and ignore everyone we know.', true)
  RETURNING id INTO list3_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list3_id, 63174,  'Succession',       NULL, 1),
    (list3_id, 136315, 'The Bear',         NULL, 2),
    (list3_id, 95396,  'Severance',        NULL, 3),
    (list3_id, 110316, 'The White Lotus',  NULL, 4),
    (list3_id, 97546,  'Yellowjackets',    NULL, 5),
    (list3_id, 66732,  'Stranger Things',  NULL, 6),
    (list3_id, 76331,  'Game of Thrones',  NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 4: Prestige Drama
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Prestige Drama', 'Slow-burn, cinematic television at its finest. Watch these and feel like a more thoughtful person.', true)
  RETURNING id INTO list4_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list4_id, 1104,  'Mad Men',          NULL, 1),
    (list4_id, 37680, 'Downton Abbey',    NULL, 2),
    (list4_id, 65494, 'The Crown',        NULL, 3),
    (list4_id, 46648, 'The Americans',    NULL, 4),
    (list4_id, 17861, 'Boardwalk Empire', NULL, 5),
    (list4_id, 1426,  'Six Feet Under',   NULL, 6);

  -- ──────────────────────────────────────────────
  -- List 5: Sci-Fi Must-Sees
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Sci-Fi Must-Sees', 'From near-future tech horror to space opera. Essential viewing for anyone who wants to think harder about the world.', true)
  RETURNING id INTO list5_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list5_id, 42009, 'Black Mirror',           NULL, 1),
    (list5_id, 63247, 'Westworld',              NULL, 2),
    (list5_id, 70523, 'Dark',                   NULL, 3),
    (list5_id, 1413,  'Battlestar Galactica',   NULL, 4),
    (list5_id, 63639, 'The Expanse',            NULL, 5),
    (list5_id, 66732, 'Stranger Things',        NULL, 6),
    (list5_id, 95396, 'Severance',              NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 6: Hidden Gems
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Hidden Gems', 'Criminally underseen. The shows that didn''t get the audience they deserved. Watch them. Tell your friends.', true)
  RETURNING id INTO list6_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list6_id, 58695, 'Halt and Catch Fire',  NULL, 1),
    (list6_id, 58811, 'The Leftovers',        NULL, 2),
    (list6_id, 44249, 'Enlightened',          NULL, 3),
    (list6_id, 73975, 'Barry',                NULL, 4),
    (list6_id, 61664, 'Detectorists',         NULL, 5),
    (list6_id, 67673, 'Fleabag',              NULL, 6);

  -- ──────────────────────────────────────────────
  -- List 7: Reality TV Guilty Pleasures
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Reality TV Guilty Pleasures', 'You said you wouldn''t watch it. You did. You have no regrets. Neither do we.', true)
  RETURNING id INTO list7_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list7_id, 44217, 'The Great British Bake Off', NULL, 1),
    (list7_id, 37679, 'RuPaul''s Drag Race',        NULL, 2),
    (list7_id, 2861,  'Survivor',                   NULL, 3),
    (list7_id, 1116,  'The Amazing Race',           NULL, 4),
    (list7_id, 2741,  'Project Runway',             NULL, 5);

END $$;
```

**Step 2: Verify the file is correct**

Confirm all 7 lists and their items are present.

**Step 3: Commit**

```bash
git add supabase-seed.sql
git commit -m "feat: expand editorial seed to 7 curated lists"
```

---

### Task 3: Add getShowsByNetwork to lib/tmdb.ts

**Files:**
- Modify: `lib/tmdb.ts`

**Step 1: Add the function**

Append to `lib/tmdb.ts`:

```typescript
export async function getShowsByNetwork(networkId: number) {
  return tmdbFetch(
    `/discover/tv?with_networks=${networkId}&sort_by=popularity.desc&language=en-US&page=1`
  )
}
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add lib/tmdb.ts
git commit -m "feat: add getShowsByNetwork TMDB function"
```

---

### Task 4: Update shows/page.tsx with streaming platform sections

**Files:**
- Modify: `app/(main)/shows/page.tsx`

**Step 1: Replace the file**

```typescript
import { Suspense } from 'react'
import { getTrendingShows, getShowsByNetwork, tmdbImageUrl } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ShowsSearch from './ShowsSearch'

export const dynamic = 'force-dynamic'

type TMDBResult = {
  id: number
  name: string
  poster_path: string | null
  vote_average: number
  first_air_date: string
}

// Network IDs
const NETWORKS = [
  { id: 213,  label: 'Popular on Netflix' },
  { id: 49,   label: 'Popular on HBO' },
  { id: 2552, label: 'Popular on Apple TV+' },
  { id: 1024, label: 'Popular on Prime Video' },
]

export default async function ShowsPage() {
  const [trending, netflix, hbo, appletv, prime, supabase] = await Promise.all([
    getTrendingShows().catch(() => null),
    getShowsByNetwork(213).catch(() => null),
    getShowsByNetwork(49).catch(() => null),
    getShowsByNetwork(2552).catch(() => null),
    getShowsByNetwork(1024).catch(() => null),
    createClient(),
  ])

  const trendingShows: TMDBResult[] = trending?.results?.slice(0, 20) || []

  const networkRows: { label: string; shows: TMDBResult[] }[] = [
    { label: 'Popular on Netflix',    shows: netflix?.results?.slice(0, 8) || [] },
    { label: 'Popular on HBO',        shows: hbo?.results?.slice(0, 8) || [] },
    { label: 'Popular on Apple TV+',  shows: appletv?.results?.slice(0, 8) || [] },
    { label: 'Popular on Prime Video', shows: prime?.results?.slice(0, 8) || [] },
  ].filter(row => row.shows.length > 0)

  const { data: recentReviews } = await supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .not('review', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18]">Shows</h1>
      </div>

      {/* Search */}
      <Suspense>
        <ShowsSearch />
      </Suspense>

      {/* Trending this week */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
          Trending This Week
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingShows.map(show => {
            const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
            const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
            return (
              <Link key={show.id} href={`/shows/${show.id}`} className="group">
                <div className="relative aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                  {posterUrl ? (
                    <img src={posterUrl} alt={show.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-2">{show.name}</div>
                  )}
                  <div className="absolute inset-0 bg-[#1a1a18]/0 group-hover:bg-[#1a1a18]/20 transition-colors flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.57-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-[#1a1a18] truncate">{show.name}</p>
                {year && <p className="text-[11px] text-[#6b6560]">{year}</p>}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Streaming platform rows */}
      {networkRows.map(row => (
        <section key={row.label}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
            {row.label}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {row.shows.map(show => {
              const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
              const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group flex-shrink-0 w-32 sm:w-36">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-2">{show.name}</div>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-[#1a1a18] truncate">{show.name}</p>
                  {year && <p className="text-[10px] text-[#6b6560]">{year}</p>}
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {/* Just reviewed */}
      {recentReviews && recentReviews.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
            Just Reviewed…
          </h2>
          <div className="space-y-3">
            {recentReviews.map((log: {
              id: string
              tmdb_show_id: number
              show_title: string
              show_poster_path: string | null
              overall_score: number | null
              review: string | null
              created_at: string
              profiles: { username: string; avatar_url: string | null } | null
            }) => {
              const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
              return (
                <div key={log.id} className="flex gap-4 bg-[#f5f2ed] border border-[#e0dbd4] px-4 py-3">
                  <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                    <div className="w-10 h-14 overflow-hidden bg-[#e0dbd4]">
                      {posterUrl ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#e0dbd4]" />}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#e0dbd4] overflow-hidden flex items-center justify-center text-[9px] font-bold text-[#6b6560]">
                        {log.profiles?.avatar_url ? <img src={log.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : log.profiles?.username?.[0]?.toUpperCase()}
                      </div>
                      <Link href={`/profile/${log.profiles?.username}`} className="text-xs font-semibold text-[#1a1a18] hover:text-[#7c9e7a] transition-colors">{log.profiles?.username}</Link>
                      <span className="text-[#6b6560] text-xs">reviewed</span>
                      <Link href={`/shows/${log.tmdb_show_id}`} className="text-xs font-semibold text-[#1a1a18] truncate hover:text-[#7c9e7a] transition-colors">{log.show_title}</Link>
                      {log.overall_score && <span className="ml-auto text-xs font-bold text-[#7c9e7a] flex-shrink-0">{log.overall_score.toFixed(1)}</span>}
                    </div>
                    <p className="text-xs text-[#6b6560] italic line-clamp-2">&ldquo;{log.review}&rdquo;</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add "app/(main)/shows/page.tsx"
git commit -m "feat: add Netflix/HBO/Apple TV+/Prime streaming sections to shows page"
```

---

### Task 5: Update lists/page.tsx with poster backfill and early community messaging

**Files:**
- Modify: `app/(main)/lists/page.tsx`

**Step 1: Replace the file**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getShow, tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lists } = await supabase
    .from('lists')
    .select('id, title, description, is_public, created_at, profiles(username), list_items(tmdb_show_id, show_poster_path, show_title, position)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // Backfill missing poster paths from TMDB (for seed data with null poster_path)
  const needPosters = new Set<number>()
  for (const list of lists || []) {
    const items = (list.list_items || []) as { tmdb_show_id: number; show_poster_path: string | null; position: number; show_title: string }[]
    for (const item of items.slice(0, 4)) {
      if (!item.show_poster_path && item.tmdb_show_id) {
        needPosters.add(item.tmdb_show_id)
      }
    }
  }

  const posterMap = new Map<number, string | null>()
  if (needPosters.size > 0) {
    const results = await Promise.all(
      Array.from(needPosters).map(async id => {
        try {
          const show = await getShow(id)
          return { id, poster_path: (show.poster_path as string | null) || null }
        } catch {
          return { id, poster_path: null }
        }
      })
    )
    results.forEach(r => posterMap.set(r.id, r.poster_path))
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18] mb-3">Lists</h1>
        <p className="text-sm text-[#6b6560] leading-relaxed max-w-lg">
          Curated collections from the trakr community — from prestige drama to guilty pleasures.
        </p>
        {user && (
          <Link
            href="/lists/new"
            className="inline-block mt-4 bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            + Create a List
          </Link>
        )}
      </div>

      {/* Early community note */}
      <div className="bg-[#f0ede8] border border-[#e0dbd4] px-5 py-4">
        <p className="text-sm text-[#1a1a18] font-semibold mb-0.5">trakr is just getting started.</p>
        <p className="text-xs text-[#6b6560] leading-relaxed">
          The lists below are curated by us to get things going. As the community grows, you&apos;ll see lists from people you follow here.{' '}
          {!user && (
            <Link href="/login?form=signup" className="text-[#7c9e7a] hover:underline font-medium">
              Create an account
            </Link>
          )}{!user && ' to share yours.'}
        </p>
      </div>

      {/* Lists grid */}
      {!lists || lists.length === 0 ? (
        <div>
          <p className="text-sm text-[#6b6560] py-6">No lists yet.</p>
          {user && (
            <Link href="/lists/new" className="text-[#7c9e7a] text-sm hover:underline">
              Be the first — create a list →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(list => {
            type ListItem = { tmdb_show_id: number; show_poster_path: string | null; show_title: string; position: number }
            const items = [...((list.list_items as ListItem[] | null) || [])]
              .sort((a, b) => a.position - b.position)
              .slice(0, 4)
            return (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="group border border-[#e0dbd4] hover:border-[#7c9e7a] transition-colors bg-[#fafaf7]"
              >
                {/* 4-poster collage */}
                <div className="grid grid-cols-4 border-b border-[#e0dbd4]">
                  {[0, 1, 2, 3].map(i => {
                    const item = items[i]
                    const rawPath = item?.show_poster_path || (item ? posterMap.get(item.tmdb_show_id) : null) || null
                    const url = rawPath ? tmdbImageUrl(rawPath, 'w92') : null
                    return (
                      <div key={i} className="aspect-[2/3] overflow-hidden bg-[#f0ede8]">
                        {url ? (
                          <img src={url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                        ) : (
                          <div className="w-full h-full bg-[#e8e3dc] flex items-center justify-center">
                            {item && (
                              <span className="text-[8px] text-[#6b6560] text-center px-0.5 leading-tight font-medium">
                                {item.show_title?.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-[#1a1a18] truncate group-hover:text-[#7c9e7a] transition-colors">
                    {list.title}
                  </p>
                  {list.description && (
                    <p className="text-xs text-[#6b6560] mt-0.5 line-clamp-2 leading-relaxed">{list.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-[#6b6560]">
                      {(list.list_items as ListItem[] | null)?.length || 0} shows
                    </p>
                    {(list.profiles as { username: string } | null)?.username && (
                      <p className="text-[10px] text-[#6b6560] truncate">
                        by {(list.profiles as { username: string }).username}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add "app/(main)/lists/page.tsx"
git commit -m "feat: add TMDB poster backfill and early community messaging to lists page"
```

---

### Task 6: Update ProfileTabs.tsx with welcoming empty states

**Files:**
- Modify: `app/(main)/profile/[username]/ProfileTabs.tsx`

**Step 1: Replace the empty state for the SHOWS tab**

Find this block in `ProfileTabs.tsx`:
```tsx
          {loggedShows.length === 0 ? (
            <p className="text-sm text-[#6b6560] py-6">No shows logged yet.</p>
          ) : (
```

Replace with:
```tsx
          {loggedShows.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[#e0dbd4] bg-[#fafaf7]">
              <p className="text-sm font-semibold text-[#1a1a18] mb-1">Nothing logged yet</p>
              <p className="text-xs text-[#6b6560] mb-4">Start building your watchlist.</p>
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Browse Shows →
              </Link>
            </div>
          ) : (
```

**Step 2: Replace the REVIEWS empty state**

Find:
```tsx
          {reviews.length === 0 ? (
            <p className="text-sm text-[#6b6560] py-6">No reviews written yet.</p>
```

Replace with:
```tsx
          {reviews.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[#e0dbd4] bg-[#fafaf7]">
              <p className="text-sm font-semibold text-[#1a1a18] mb-1">No reviews yet</p>
              <p className="text-xs text-[#6b6560] mb-4">Log a show and share your thoughts.</p>
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Find a Show →
              </Link>
            </div>
```

**Step 3: Replace the JOURNAL empty state**

Find:
```tsx
          {loggedShows.length === 0 ? (
            <p className="text-sm text-[#6b6560] py-6">Nothing in the journal yet.</p>
```

Replace with:
```tsx
          {loggedShows.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[#e0dbd4] bg-[#fafaf7]">
              <p className="text-sm font-semibold text-[#1a1a18] mb-1">Your journal is empty</p>
              <p className="text-xs text-[#6b6560] mb-4">Every show you log will appear here by date.</p>
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Start Logging →
              </Link>
            </div>
```

**Step 4: Verify build passes**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add "app/(main)/profile/[username]/ProfileTabs.tsx"
git commit -m "feat: add welcoming empty states with CTAs to profile tabs"
```

---

### Task 7: Update profile page with prominent edit CTA and complete profile nudge

**Files:**
- Modify: `app/(main)/profile/[username]/page.tsx`

**Step 1: Add "complete your profile" nudge for own empty profile**

In `profile/[username]/page.tsx`, after the genre chips block (after the closing `{favouriteGenres.length > 0 && (...)}` block), add this before the closing `</div>` of the profile header section. Find the "Genre chips" comment and the block that follows, and add after it:

```tsx
            {/* Complete profile nudge — own profile, no bio set */}
            {isOwnProfile && !profile.bio && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#6b6560] bg-[#f0ede8] border border-[#e0dbd4] px-3 py-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Add a bio and your favourite genres to complete your profile.</span>
                <Link href="/profile/edit" className="text-[#7c9e7a] font-semibold hover:underline ml-auto flex-shrink-0">
                  Edit →
                </Link>
              </div>
            )}
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add "app/(main)/profile/[username]/page.tsx"
git commit -m "feat: add complete-your-profile nudge to own empty profile"
```

---

### Task 8: Update members/page.tsx with early community banner

**Files:**
- Modify: `app/(main)/members/page.tsx`

**Step 1: Add early community banner**

In `members/page.tsx`, find the header section (the `<div className="border-b border-[#e0dbd4] pb-8">` block). After the `<p>` description tag and before the closing `</div>`, insert:

```tsx
        <div className="mt-5 bg-[#f0ede8] border border-[#e0dbd4] px-4 py-3 flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7c9e7a] mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1a1a18]">trakr is just getting started</p>
            <p className="text-xs text-[#6b6560] mt-0.5 leading-relaxed">
              You&apos;re one of the first members. Invite your TV-obsessed friends and build this community together.
            </p>
          </div>
        </div>
```

**Step 2: Verify build passes**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add "app/(main)/members/page.tsx"
git commit -m "feat: add early community banner to members page"
```

---

### Task 9: Update feed/page.tsx with better empty state

**Files:**
- Modify: `app/(main)/feed/page.tsx`

**Step 1: Replace the empty logs state**

In `feed/page.tsx`, find:
```tsx
        {logs.length === 0 ? (
          <p className="text-sm text-[#6b6560] py-6">No activity yet. Log some shows to get started.</p>
        ) : (
```

Replace with:
```tsx
        {logs.length === 0 ? (
          <div className="py-8 border border-dashed border-[#e0dbd4] text-center bg-[#fafaf7]">
            <p className="text-sm font-semibold text-[#1a1a18] mb-1">Your journal is quiet</p>
            <p className="text-xs text-[#6b6560] mb-4 leading-relaxed">
              {followingIds.length === 0
                ? 'Follow people to see their logs here, or start logging yourself.'
                : 'The people you follow haven\'t logged anything yet.'}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Browse Shows →
              </Link>
              <Link href="/members" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Find People →
              </Link>
            </div>
          </div>
        ) : (
```

**Step 2: Verify build passes**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add "app/(main)/feed/page.tsx"
git commit -m "feat: improve empty state in journal/feed page"
```

---

### Task 10: Final build verification and push

**Step 1: Run full build**

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Generating static pages
```

All routes should compile. No TypeScript errors.

**Step 2: Push to remote**

```bash
git push origin main
```

**Step 3: Note for user — run these SQL files in Supabase Dashboard**

The following SQL files need to be run in Supabase Dashboard → SQL Editor:
1. `supabase-migration.sql` — adds trigger + columns (idempotent, safe to re-run)
2. `supabase-seed.sql` — replace `YOUR-USER-UUID` with your actual user ID first

