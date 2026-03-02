# Design: Profile Fix, Editorial Lists, Shows Streaming Sections, Early Community UX

Date: 2026-03-02

## Summary

Four improvements to make trakr feel polished and populated for early users:
1. Fix the blank profile page (missing DB trigger + weak empty states)
2. Seed editorial/curated lists with real TMDB data
3. Add streaming platform sections to the shows page
4. Add early-community messaging across the app

---

## 1. Profile Page Fix

### Root Cause
No `handle_new_user()` Postgres trigger exists. On signup, the `auth.users` row is created with `user_metadata.username`, but the `profiles` table row may not be created or may have `username = null`. This causes `/profile/[username]` to either 404 or render a blank page.

### Fix: Database Trigger
Add to `supabase-migration.sql`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username')
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

### Fix: Profile Empty State UX
When `loggedShows.length === 0` on the SHOWS tab in `ProfileTabs.tsx`, show a welcoming panel:
- "Your watchlist is empty — find something to watch" with a "Browse Shows →" button
- Same treatment for REVIEWS and LISTS tabs (encouraging CTAs, not just grey text)

Profile header: always show "edit profile" link prominently when `isOwnProfile`, even if bio/avatar are not set. Add a subtle "Complete your profile →" nudge if bio is empty and user is viewing their own profile.

---

## 2. Editorial Curated Lists

### Approach: Database Seed
`supabase-seed.sql` updated with 7 editorial lists. The seed uses the existing `YOUR-USER-UUID` pattern. Shows are tagged with actual TMDB poster paths where known.

Lists:
1. Essential Crime TV (existing, improved)
2. Best Comedies Ever (existing, improved)
3. Can't Stop Watching (existing, improved)
4. Prestige Drama (new) — Succession, The Crown, Mad Men, Downton Abbey, The Americans
5. Sci-Fi Must-Sees (new) — Black Mirror, Westworld, Stranger Things, Dark, Battlestar Galactica
6. Reality TV Guilty Pleasures (new) — The Great British Bake Off, RuPaul's Drag Race, Survivor, The Amazing Race
7. Hidden Gems (new) — Fleabag, Detectorists, Enlightened, Halt and Catch Fire, The Leftovers

### Lists Page: Poster Backfill
`app/(main)/lists/page.tsx` server-side: for each list, for any list_items with `show_poster_path = null`, fetch the show details from TMDB and use the poster. Fetched in parallel, cached with `revalidate: 86400`.

---

## 3. Shows Page: Streaming Platform Sections

### New TMDB Function
`lib/tmdb.ts` gets `getShowsByNetwork(networkId: number)` using:
```
/discover/tv?with_networks={id}&sort_by=popularity.desc&language=en-US
```

### Network IDs
- Netflix: 213
- HBO: 49
- Apple TV+: 2552
- Prime Video: 1024

### Shows Page Layout (updated)
```
[Search bar]
[Trending This Week — 5-col grid, 20 shows]
[Popular on Netflix — horizontal scroll row, 8 shows]
[Popular on HBO — horizontal scroll row, 8 shows]
[Popular on Apple TV+ — horizontal scroll row, 8 shows]
[Popular on Prime Video — horizontal scroll row, 8 shows]
[Just Reviewed — community reviews section]
```

All network fetches run in parallel with `Promise.all`.

---

## 4. Early Community Messaging

### Members Page
Banner at top (above the grid):
> "trakr is just getting started. You're among the first."
Styled as a warm `bg-[#f0ede8] border border-[#e0dbd4]` panel.

### Lists Page
When no user lists exist, a note beneath the editorial lists:
> "Be among the first to share a list."
With a "Create a List →" CTA.

### Feed/Journal Page
When no following activity and `logs.length === 0`:
> "Your journal is empty. Start by finding a show to log."
With links to /shows and /members.

---

## Files Changed

| File | Change |
|---|---|
| `supabase-migration.sql` | Add `handle_new_user` trigger |
| `supabase-seed.sql` | 7 editorial lists with more shows |
| `app/(main)/profile/[username]/ProfileTabs.tsx` | Better empty states with CTAs |
| `app/(main)/profile/[username]/page.tsx` | Prominent edit CTA on own empty profile |
| `app/(main)/lists/page.tsx` | Poster backfill from TMDB, early community message |
| `app/(main)/shows/page.tsx` | 4 streaming platform scroll rows |
| `app/(main)/members/page.tsx` | Early community banner |
| `app/(main)/feed/page.tsx` | Better empty state |
| `lib/tmdb.ts` | Add `getShowsByNetwork` |

## Verification
- `npm run build` must pass with no TypeScript errors
- Commit: `feat: profile fix, editorial lists, streaming sections, early community UX`
