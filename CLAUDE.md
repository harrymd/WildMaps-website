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
    mapConfig.ts        # BUCKET_URL, DATA_ROOT, TILE_DATA_ROOT, PATH_STYLES — S3 path constants

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
    SelectAdm0.tsx, SelectAdm1.tsx  (exist but currently skipped in workflow)

  components/
    Layout.tsx          # Shell: two sidebars + centre map + router outlet
    MapContainer.tsx    # Wraps useMap; renders map canvas and logo
    Sidebar.tsx         # Reusable animated sidebar (left or right)
    BasemapControls/    # Right-sidebar UI + config.ts for basemap/overlay options
    GeneralSelectComponent.tsx  # Reusable card-list selector used by most pages
    BarChart.tsx        # D3 stacked bar charts
    StudyDesignSection.tsx  # Collapsible study design section on FinalScreen
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
data_inputs/catalogs/       — CSV catalogs (study_metadata_catalog.csv keyed by dataset_id)
data_inputs/styles/         — MapLibre style JSON files
data_inputs/colour_ramps/   — Land use colour scheme CSV
data_inputs/website_assets/ — Splash video, logo

data_outputs/adm_bdry_info.json            — Country/region boundary metadata
data_outputs/raster_analysis/
  results_summary.json                               — All dataset metadata (loaded at startup)
  results_{paddedId}_{stringId}.json                — Per-dataset detail (lazy-loaded on FinalScreen)
  raster_tiles/SDM/{folder}/{paddedId}_{stringId}_zoom_auto/{z}/{x}/{y}.png
```

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

- **`/survey` route** is handled by `AppContent` in `App.tsx` before `AppProvider` or the loading screen are mounted. `SurveyPage` fetches `study_metadata_dictionary.csv` directly from S3 (does not use `AppContext`). The API endpoint is set via `VITE_SURVEY_API_URL` in `.env.local`; form submissions are saved to a private S3 bucket and trigger a team notification email via SES (eu-west-2).
- **Survey button** ("Add your data") lives in `SelectStartingFilter` as a callout box rendered via the `preHeading` prop of `GeneralSelectComponent` — visible only on the initial Dataset browser step. It is not in the map overlay.
- **Map overlay elements** (logo only now) live inside `mapContainerRef`. `useMap.ts::adjustMapElements` translates them by querying `.map-bottom-right-image` so they stay clear of sidebars. Any new overlay element added to the map must follow this CSS-class pattern.
- **`GeneralSelectComponent`** accepts an optional `preHeading` prop (rendered above the `<h2>` heading). Only `SelectStartingFilter` uses it currently.
- **`study_metadata_dictionary.csv`** has three additional columns beyond the original three: `form_type` (`string|integer|choices|ratio|predictors`), `choices` (comma-separated option list), and `form_prompt` (optional question sub-text). `StudyMetadataDictionaryEntry` in `types/index.ts` reflects this. The `predictors` type renders a structured repeating entry (name, resolution, units) instead of a free-text area.
- **Deployment** requires a `.env.production.local` file at the repo root containing `VITE_USE_TESTING_PREFIX=false`. Vite gives `.env.production.local` highest priority for production builds, overriding the `VITE_USE_TESTING_PREFIX=true` typically set in `.env.local` for local dev. Without it the deployed app fetches from the S3 `test/` prefix. The deploy script uses `--no-perms` + a trailing `ssh chmod 755` because macOS rsync copies local directory permissions (700) to the server otherwise, causing 403 errors.
- **Deploy path** is `~/public_html/demo/wildmaps/` on Bluehost, so the app is served at `demo.hkuril.com/wildmaps`. The Vite `base` is `/wildmaps/` (in `vite.config.ts`) and `<Router basename={import.meta.env.BASE_URL}>` in `App.tsx` keeps client-side routes scoped to that prefix. The SPA-fallback `.htaccess` lives at `~/public_html/demo/wildmaps/.htaccess` on the server (excluded from rsync). `demo.hkuril.com/` itself serves a separate static `index.html` linking to `/wildmaps/` — uploaded manually, not part of the build.
- **Two selection orderings** are supported: Region-first and Superspecies-first. `navigationUtils.ts` encodes both route sequences.
- **`SelectAdm0` and `SelectAdm1`** exist as pages but are not wired into the navigation workflow — ADM selection happens inside `FinalScreen` instead.
- **`src/old/`** is gitignored — legacy files kept locally, not tracked.
- **`AdmData` typing**: `AppContext` initialises `admData` as `{}` before the S3 fetch completes. Hooks that use it should cast with `admData as AdmData` after checking for key presence, since the context types it as `AdmData | Record<string, never>`.
- **`useMap.ts`** uses imperative MapLibre DOM manipulation — avoid adding fast-changing props that would trigger frequent re-initialisations. The `projection` option is passed as `any` because MapLibre 5.6 supports it at runtime but the TS definitions don't yet include it.
- **`BarChart.tsx`** uses imperative D3 DOM manipulation inside a `useEffect` — take care when re-rendering.
- **`study_metadata_catalog.csv`** is keyed by `dataset_id` (string). `AppContext` converts it to `StudyMetadataCatalog`: a nested record `{ [dataset_id]: { [metadata_key]: string } }`. `StudyDesignSection` looks up the current `datasetKey` in this catalog.
- All S3 assets are public; there is no auth layer.
