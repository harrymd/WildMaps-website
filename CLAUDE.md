# WildMaps — Claude Code Context

## What this app does

WildMaps is an interactive web app for exploring habitat suitability maps for endangered species. Users follow a guided multi-step workflow to filter by region and/or species, then view the selected dataset rendered as raster tiles on an interactive map, alongside bar charts summarising habitat suitability and land use.

All data (raster tiles, map styles, metadata dictionaries, chart data) is served from an AWS S3 bucket — the app is entirely static/serverless.

---

## Stack

| Tool | Version |
|------|---------|
| React | 19.1 |
| TypeScript | 5.x (strict mode) |
| MapLibre GL JS | 5.6 |
| React Router DOM | 7.6 |
| D3 | 7.9 |
| PapaParse | 5.5 |
| Vite | 6.3 |
| Tailwind CSS | 3.4 |
| Vitest | 4.x |
| Lucide React | icons |

The project is **TypeScript throughout** — all source files use `.ts` / `.tsx`. Shared interfaces and types live in `src/types/index.ts`.

---

## Project layout

```
src/
  App.tsx              # Root: loading screen, tutorial overlay, provider/router setup
  main.tsx             # ReactDOM.createRoot entry point
  index.css            # Tailwind directives only (@tailwind base/components/utilities)

  types/
    index.ts           # All shared TypeScript interfaces and types

  context/
    AppContext.tsx      # Global state: all S3 data loaded here on startup

  constants/
    mapConfig.ts        # BUCKET_URL, DATA_ROOT, TILE_DATA_ROOT, PATH_STYLES, APPROVED_METADATA_ROOT — S3 path constants
    methodologicalStandards.ts  # Hardcoded checklist data model + Gold/Silver/Bronze scoring, reused by both SurveyPage and the approved-metadata display

  hooks/
    useMap.ts                      # Core MapLibre hook: init, layer management, projection switching
    useLayerState.ts               # Visibility state for data/overlay/baselayer
    useFilterState.ts              # URL search-param state (replaces useState for selections)
    useDatasetInfo.ts              # Derives current dataset key + scale from URL params
    useDetailedData.ts             # Lazy-loads per-dataset JSON from S3 on final screen
    useLocationSelection.ts        # ADM0/ADM1 option lists
    useUpdateMapOnDatasetChange.ts # Adds raster tile layer when dataset changes
    useMapPanning.ts               # Dispatches pan events from pages
    useDefaultMapPanning.ts        # Pan-on-mount to default view

  pages/               # One component per step in the selection workflow
    SelectStartingFilter.tsx  → / (choose Region-first or Species-first)
    SelectRegion.tsx          → /region
    SelectSubRegion.tsx       → /subregion
    SelectSuperSpecies.tsx    → /superspecies
    SelectSpecies.tsx         → /species
    SelectDataset.tsx         → /dataset
    FinalScreen.tsx           → /final
    SurveyPage.tsx            → /survey (standalone data submission form — no loading screen, no AppProvider)
    SurveyPage.css            # Scoped `.wm-survey` theme (Manrope font, teal/rust/purple palette) shared by both survey sections
    SelectAdm0.tsx, SelectAdm1.tsx  (exist but currently skipped in workflow)

  components/
    Layout.tsx          # Shell: two sidebars + centre map + router outlet
    MapContainer.tsx    # Wraps useMap; renders map canvas and logo
    Sidebar.tsx         # Reusable animated sidebar (left or right)
    BasemapControls/    # Right-sidebar UI + config.ts for basemap/overlay options
    GeneralSelectComponent.tsx  # Reusable card-list selector used by most pages
    BarChart.tsx        # D3 stacked bar charts
    StudyDesignSection.tsx  # Collapsible "Study design and metadata" section on FinalScreen — reads approvedMetadata
    MethodStandardScoreSection.tsx  # Collapsible "Methodological standard score" section on FinalScreen — full breakdown for the selected dataset
    MethodStandardMedal.tsx  # Gold/Silver/Bronze medal (or ○ for unknown) — used on SelectDataset and MethodStandardScoreSection
    MethodStandardsSection.tsx  # SurveyPage's second-page checklist UI (calculate-score widget + results tile)
    *Legend.tsx / *ColorBar.tsx  # Map legend components

  utils/
    mapPanningUtils.ts  # Pan helpers: fitBounds, flyTo, or event-based
    navigationUtils.ts  # getNextRoute / getPreviousRoute for both workflow orderings
    chartDataUtils.ts   # Transforms raw dataset JSON into D3-ready chart data
    navigationUtils.test.ts  # Unit tests for route logic
    chartDataUtils.test.ts   # Unit tests for chart data transforms

  test/
    setup.ts            # @testing-library/jest-dom setup for Vitest
```

---

## State management

- **Global data** lives in `AppContext` (loaded once from S3 on app start).
- **Selection state** (which region, species, dataset, etc.) is stored in **URL search params** via `useFilterState` — this means selections survive page refreshes and are shareable.
- **Map state** is owned by the `useMap` hook and communicated to map controls via prop callbacks and custom `window` events (e.g. `'panToLocation'`).
- No Redux, Zustand, or similar — context + URL params + hook-local state covers everything.

---

## Map layers

`useMap.ts` manages four named layer slots, rendered in this order (bottom → top):

1. **underlay** — base style (Positron street map, satellite, elevation, etc.)
2. **data** — raster tiles for the selected species distribution model
3. **baselayer** — currently unused slot
4. **overlay** — protected areas (WDPA) or labels/roads

Basemap styles are MapLibre GL style JSON files hosted on S3 at `BUCKET_URL/data_inputs/styles/`.

The map switches between **globe** projection (zoom < 4) and **Mercator** (zoom ≥ 4) automatically.

---

## Data sources (S3)

```
BUCKET_URL = https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com

data_inputs/dictionaries/   — CSV lookups (species, superspecies, regions, subregions, study metadata fields)
data_inputs/catalogs/       — CSV catalogs
data_inputs/styles/         — MapLibre style JSON files
data_inputs/colour_ramps/   — Land use colour scheme CSV
data_inputs/website_assets/ — Splash video, logo

data_outputs/adm_bdry_info.json            — Country/region boundary metadata
data_outputs/raster_analysis/
  results_summary.json                               — All dataset metadata (loaded at startup)
  results_{paddedId}_{stringId}.json                — Per-dataset detail (lazy-loaded on FinalScreen)
  raster_tiles/SDM/{folder}/{paddedId}_{stringId}_zoom_auto/{z}/{x}/{y}.png
```

A **separate** public bucket, `wildcru-wildmaps-approved-775525057974-eu-west-2-an` (see `APPROVED_METADATA_ROOT` in `constants/mapConfig.ts`), holds one JSON file per dataset — `{file_label}.json` (e.g. `0002_burns_2025_Borneo_Asian_elephant.json`), same key structure as a `SurveyPage` submission payload. This is reviewed/approved data, produced and uploaded from the WildMaps-processing repo (see its README/CLAUDE.md), not by the live survey form.

---

## Development

```bash
npm run dev        # Vite dev server
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint
npm run type-check # TypeScript type-check (tsc --noEmit)
npm test           # Vitest unit tests (run once)
npm run test:watch # Vitest in watch mode
```

---

## Things worth knowing

- **`/survey` route** is handled by `AppContent` in `App.tsx` before `AppProvider` or the loading screen are mounted. `SurveyPage` fetches `study_metadata_dictionary.csv` directly from S3 (does not use `AppContext`). The API endpoint is set via `VITE_SURVEY_API_URL` in `.env.local`; form submissions are saved to a private S3 bucket and trigger a team notification email via SES (eu-west-2). It links to `${import.meta.env.BASE_URL}survey`, not a hardcoded `/survey`, so it resolves correctly under the `/wildmaps/` base on both localhost and the deployed site.
- **Survey button** ("Add your data") lives in `SelectStartingFilter` as a callout box rendered via the `preHeading` prop of `GeneralSelectComponent` — visible only on the initial Dataset browser step. It is not in the map overlay.
- **`SurveyPage` is a two-page form, two separate features appended together**: page 1 is the existing study-metadata dictionary section; page 2 (`MethodStandardsSection.tsx`) is the "Methodological standards" checklist, ported from a standalone draft HTML tool (`../notes/chrishen_SDM_form_2026_09_17.html`). A stepper at the top and an intro callout on each page make clear these are distinct. Both pages share the `.wm-survey` theme in `SurveyPage.css` (this is the "harmonised" look — the checklist draft's palette/typography, not the original green Tailwind styling).
- **Methodological standards checklist** (`constants/methodologicalStandards.ts`): a fixed, hardcoded question set (not CSV/dictionary-driven), with conditional questions (e.g. `evaluation.2` only shown when `evaluation.1 === 'no'`) and a client-side Gold/Silver/Bronze scoring function. The "Calculate score" button is kept purely as live feedback for the submitter — the calculated tier/score is **never submitted**; only the raw per-question `yes`/`no`/`na` answers are, under payload keys prefixed `standards.` (e.g. `standards.response.0`), so the score can be recalculated downstream if the scoring rules change. The results tile's message tells the user to scroll down, where the real "Submit" button (for both pages' answers) lives.
- **`SURVEY_FORM_VERSION`** (`constants/methodologicalStandards.ts`, currently `'2.0'`) is sent as a hidden `form_version` field in every submission payload — bump it if the question set changes again.
- **Map overlay elements** (logo only now) live inside `mapContainerRef`. `useMap.ts::adjustMapElements` translates them by querying `.map-bottom-right-image` so they stay clear of sidebars. Any new overlay element added to the map must follow this CSS-class pattern.
- **`GeneralSelectComponent`** accepts an optional `preHeading` prop (rendered above the `<h2>` heading). Only `SelectStartingFilter` uses it currently.
- **`study_metadata_dictionary.csv`** has three additional columns beyond the original three: `form_type` (`string|integer|choices|ratio|predictors`), `choices` (comma-separated option list), and `form_prompt` (optional question sub-text). `StudyMetadataDictionaryEntry` in `types/index.ts` reflects this. The `predictors` type renders a structured repeating entry (name, resolution, units) instead of a free-text area.
- **Deployment** reads `VITE_USE_TESTING_PREFIX` from `.env.production.local` at the repo root — Vite gives this file highest priority for production builds, overriding whatever `.env.local` sets for local dev. It is currently `true` (**not** `false`), so `demo.hkuril.com/wildmaps` reads from the S3 `test/` prefix rather than root. This is a deliberate workaround, not the historical default — see the "S3 `test/` vs. root split" note below before changing it. The deploy script uses `--no-perms` + a trailing `ssh chmod 755` because macOS rsync copies local directory permissions (700) to the server otherwise, causing 403 errors.
- **S3 `test/` vs. root split**: the bucket keeps parallel copies of `data_inputs/` and `data_outputs/` at root and under `test/`; `VITE_USE_TESTING_PREFIX` selects which. As of the last sync they diverge: root's `data_outputs/raster_analysis/` files use an older naming scheme (`results_{string_id}.json`, no numeric `dataset_id`) that `useDetailedData.ts` no longer matches (it requests `results_{paddedId}_{dataset.string_id}.json`, giving a 403 "Forbidden" against root). Root is **frozen**: another live deployment elsewhere reads it directly, so it can't be resynced without coordinating separately. `test/data_inputs/styles/` was backfilled with the 6 style files (`esri_world_imagery`, `mapzen_elevation_and_hillshade`, `worldpop`, `landcover`, `ecoregions`, `wdpa`) that only existed at root, copied (not moved) so nothing at root was touched. (The now-unused `study_metadata_catalog.csv`, which used to be listed here as `test/`-only, has been deleted from S3 entirely — see "Approved metadata" below.)
- **Deploy path** is `~/public_html/demo/wildmaps/` on Bluehost, so the app is served at `demo.hkuril.com/wildmaps`. The Vite `base` is `/wildmaps/` (in `vite.config.ts`) and `<Router basename={import.meta.env.BASE_URL}>` in `App.tsx` keeps client-side routes scoped to that prefix. The SPA-fallback `.htaccess` lives at `~/public_html/demo/wildmaps/.htaccess` on the server (excluded from rsync). `demo.hkuril.com/` itself serves a separate static `index.html` linking to `/wildmaps/` — uploaded manually, not part of the build.
- **Two selection orderings** are supported: Region-first and Superspecies-first. `navigationUtils.ts` encodes both route sequences.
- **`SelectAdm0` and `SelectAdm1`** exist as pages but are not wired into the navigation workflow — ADM selection happens inside `FinalScreen` instead.
- **`src/old/`** is gitignored — legacy files kept locally, not tracked.
- **`AdmData` typing**: `AppContext` initialises `admData` as `{}` before the S3 fetch completes. Hooks that use it should cast with `admData as AdmData` after checking for key presence, since the context types it as `AdmData | Record<string, never>`.
- **`useMap.ts`** uses imperative MapLibre DOM manipulation — avoid adding fast-changing props that would trigger frequent re-initialisations. The `projection` option is passed as `any` because MapLibre 5.6 supports it at runtime but the TS definitions don't yet include it.
- **`BarChart.tsx`** uses imperative D3 DOM manipulation inside a `useEffect` — take care when re-rendering.
- **Approved metadata** (`AppContext.approvedMetadata` / `ensureApprovedMetadata`): replaces the old `study_metadata_catalog.csv` mechanism entirely. Lazy-fetched per dataset (keyed by the same `dataset_id` key used in `data`, not by `file_label` — the fetch itself resolves `file_label` internally) from the approved-metadata bucket, on first call from `StudyDesignSection`, `MethodStandardScoreSection`, or `SelectDataset` (which fetches for every dataset in the currently filtered list, to show a medal per row). Each entry has a `status` (`loading` | `loaded` | `missing` | `error`) plus the raw `payload` once loaded; `missing` (404/403) and `error` (anything else) get distinct user-facing messages. Fetches are deduped via a ref-backed set in `AppContext`, not the state itself, so concurrent callers for the same key don't double-fetch.
- **Gold/Silver/Bronze reuse**: `methodologicalStandards.ts` exports `answersFromPayload` / `calculateChecklistResultFromPayload`, which extract `standards.*`-prefixed answers from any submission-shaped payload (live form state or a fetched approved-metadata JSON) and run the same scoring logic `SurveyPage` uses live. Returns `null` when a payload has no usable checklist answers at all — callers (`MethodStandardMedal`, `MethodStandardScoreSection`) treat that as "unknown" (empty circle), not Bronze.
- All S3 assets are public; there is no auth layer.
