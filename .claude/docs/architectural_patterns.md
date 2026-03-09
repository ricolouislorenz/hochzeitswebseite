# Architectural Patterns

## Component Structure

Each page-level component is a named export function in `src/app/components/`. They own their own TypeScript interfaces locally — there is no shared types file.

Example: `GuestView.tsx:34–55`, `BuffetList.tsx:11–17`, `AdminDashboard.tsx:33–60` all define their own `Guest`, `RSVP`, `FoodItem` interfaces independently.

## API Call Pattern

Every component that fetches data follows this exact pattern:

1. `setIsLoading(true)` before the call
2. `try/catch/finally` block
3. `toast.error(...)` on failure (via `sonner`)
4. `setIsLoading(false)` in `finally`
5. `Authorization: Bearer {publicAnonKey}` header on every request

See: `BuffetList.tsx:28–52`, `Login.tsx:31–65`, `AdminDashboard.tsx` (multiple fetch calls).

## Embedded Views Pattern (GuestView)

`GuestView` does **not** use React Router for its sub-pages. Instead it uses a `currentView` state string to swap between embedded sections:

```
"invitation" | "ceremony" | "buffet" | "gallery" | "tja"
```

See `GuestView.tsx:88–90`. Child components (`Ceremony`, `TJAView`, `PhotobookGallery`) are imported and rendered conditionally inside `GuestView`.

This means adding a new section to the guest area requires:
1. A new value in the union type
2. A conditional render block inside `GuestView`
3. Navigation trigger (button/tab)

## State Persistence via localStorage

GuestView persists form draft state and scroll position to `localStorage` using code-scoped keys:

- `guest-form-draft:{code}` — serialized form state
- `guest-form-scroll:{code}` — scroll position

See `GuestView.tsx:104–105`. A `useRef` guard (`draftHydratedRef`) prevents re-hydration after the first load (`GuestView.tsx:102`).

Login also stores `guestCode` in localStorage for re-authentication: `Login.tsx:53`.

## KV Data Model

The backend uses a flat key-value store backed by `kv_store_bda29bfd` Postgres table. Key prefixes:

| Key pattern | Value |
|---|---|
| `guest:{code}` | `{ code, name, isPlural, gender, createdAt }` |
| `rsvp:{code}` | `{ code, guestName, attending, numberOfGuests, foodItems[], needsAccommodation, submittedAt }` |

`getByPrefix(prefix)` enables scanning all guests or all RSVPs. See `kv_store.tsx:80–86`.

Deleting a guest always also deletes their RSVP: `index.tsx:327–329`.

## Gender-Aware German Text

`GuestView` supports three guest gender modes: `"male"` | `"female"` | `"plural"`. A `getTexts(gender)` helper at `GuestView.tsx:115` returns all UI strings in the correct grammatical form. When adding new visible text to GuestView, all three variants must be provided.

## shadcn/ui Component Usage

All UI primitives are imported from `./ui/` (e.g., `Button`, `Card`, `Input`, `Badge`, `Dialog`). These are wrappers around Radix UI. Do not install new UI component libraries — extend via new shadcn components in `src/app/components/ui/` instead.

## Theme & Brand Colors

Custom CSS variables are defined in `src/styles/theme.css:43–48`:

| Variable | Hex | Usage |
|---|---|---|
| `--warm-gold` | `#C6A75E` | Primary action color |
| `--blush-rose` | `#E8C7C8` | Accent / borders |
| `--sage-green` | `#A3B18A` | Secondary action color |
| `--ivory` | `#F6F1E9` | Background |

These map to Tailwind's `primary`, `secondary`, `accent`, and `background` tokens via `@theme inline` in `theme.css:87`.

## Backend Route Naming

All Hono routes are prefixed with `/make-server-bda29bfd/`. Route groups:

- `/admin/*` — admin-only operations (guest CRUD, dashboard stats, buffet edits)
- `/guest/*` — guest-facing operations (login, RSVP submit/get)
- `/buffet` — public buffet list

See `supabase/functions/server/index.tsx:124–563`.
