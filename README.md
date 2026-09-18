# WildMaps

Interactive web app for exploring habitat suitability maps for endangered species. Users follow a guided multi-step workflow to filter by region and/or species, then view the selected dataset rendered as raster tiles on an interactive map, alongside bar charts summarising habitat suitability and land use.

All data (raster tiles, map styles, metadata, chart data) is served from an AWS S3 bucket — the app is entirely static and serverless.

---

## Stack

| Tool | Version |
|------|---------|
| React | 19.1 |
| TypeScript | 5.x |
| MapLibre GL JS | 5.6 |
| React Router DOM | 7.6 |
| D3 | 7.9 |
| PapaParse | 5.5 |
| Vite | 6.3 |
| Tailwind CSS | 3.4 |
| Vitest | 4.x |

---

## Development

```bash
npm install
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint
npm run type-check # TypeScript type-check (tsc --noEmit)
npm test           # Vitest unit tests
npm run test:watch # Vitest in watch mode
```

---

## Project layout

```
src/
  App.tsx              # Root: loading screen, tutorial overlay, provider/router setup
  main.tsx             # ReactDOM.createRoot entry point
  index.css            # Tailwind directives only

  types/
    index.ts           # All shared TypeScript interfaces and types

  context/
    AppContext.tsx      # Global state: all S3 data loaded here on startup

  constants/
    mapConfig.ts       # BUCKET_URL, DATA_ROOT, TILE_DATA_ROOT, PATH_STYLES, APPROVED_METADATA_ROOT — S3 path constants
    methodologicalStandards.ts  # Checklist data model + Gold/Silver/Bronze scoring, shared by the survey form and the approved-metadata display

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
    SurveyPage.tsx            → /survey (standalone two-page data submission form — no AppProvider)
    SurveyPage.css            # Shared `.wm-survey` theme for both survey pages
    SelectAdm0.tsx, SelectAdm1.tsx  (exist but currently skipped in workflow)

  components/
    Layout.tsx          # Shell: two sidebars + centre map + router outlet
    MapContainer.tsx    # Wraps useMap; renders map canvas and logo
    Sidebar.tsx         # Reusable animated sidebar (left or right)
    BasemapControls/    # Right-sidebar UI + config for basemap/overlay options
    GeneralSelectComponent.tsx  # Reusable card-list selector used by most pages
    BarChart.tsx        # D3 stacked bar charts
    StudyDesignSection.tsx  # "Study design and metadata" section on FinalScreen — reads approved-metadata bucket
    MethodStandardScoreSection.tsx  # "Methodological standard score" section on FinalScreen — full checklist breakdown
    MethodStandardMedal.tsx  # Gold/Silver/Bronze medal (or ○ for unknown), shown on SelectDataset and FinalScreen
    MethodStandardsSection.tsx  # Survey page 2: Gold/Silver/Bronze methodological standards checklist
    *Legend.tsx / *ColorBar.tsx  # Map legend components

  utils/
    navigationUtils.ts  # getNextRoute / getPreviousRoute for both workflow orderings
    mapPanningUtils.ts  # Pan helpers: fitBounds, flyTo, or event-based
    chartDataUtils.ts   # Transforms raw dataset JSON into D3-ready chart data

  test/
    setup.ts            # @testing-library/jest-dom setup

  utils/
    navigationUtils.test.ts  # Unit tests for route logic
    chartDataUtils.test.ts   # Unit tests for chart data transforms
```

---

## Deployment

The app is hosted on Bluehost as a static site. To build and deploy in one step:

```bash
npm run deploy
```

This runs `npm run build` then rsyncs the `dist/` output to `~/public_html/demo/wildmaps/` on the Bluehost server (using the `bluehost` SSH host alias), so the app is served at `demo.hkuril.com/wildmaps`. The Vite `base` is set to `/wildmaps/` and the React Router uses `import.meta.env.BASE_URL` as its `basename`, so all asset URLs and client-side routes resolve under that prefix. The `.htaccess` file on the server is preserved across deploys (`--exclude='.htaccess'`); the SPA-fallback rewrite rule lives in `~/public_html/demo/wildmaps/.htaccess` (rewriting unknown paths under `/wildmaps/` to `index.html`). A trailing `ssh chmod 755` ensures the target directory stays world-traversable (macOS rsync otherwise copies the local `dist/` directory's 700 permissions).

`demo.hkuril.com` itself serves a small static landing page (`~/public_html/demo/index.html`) that links through to `/wildmaps/`. That file is not part of the build and is uploaded manually.

**Prerequisites:**
- An SSH host alias named `bluehost` in `~/.ssh/config`.
- A `.env.production.local` file at the repo root controlling which S3 prefix the deployed build reads from. Vite gives this file the highest priority for production builds, so it overrides whatever `VITE_USE_TESTING_PREFIX` is set to in `.env.local` for local dev.

**Note:** `VITE_USE_TESTING_PREFIX` is currently set to `true` in `.env.production.local`, so `demo.hkuril.com/wildmaps` reads from the S3 `test/` prefix — the bucket root is frozen because another live deployment elsewhere consumes it directly and root's `data_outputs/raster_analysis/` files use an older, incompatible naming/schema (no numeric `dataset_id` + `string_id` split) that the current app code doesn't support. See "S3 `test/` vs. root split" below.

---

## AWS S3 data sources

All data is served from a public S3 bucket:

```
BUCKET_URL = https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com
```

### Inputs (`data_inputs/`)

| Path | Format | Purpose |
|------|--------|---------|
| `data_inputs/dictionaries/species_dictionary.csv` | CSV | Maps common name → scientific name + superspecies |
| `data_inputs/dictionaries/superspecies_dictionary.csv` | CSV | Superspecies metadata (scientific name, emoji) |
| `data_inputs/dictionaries/region_dictionary.csv` | CSV | Region names and bounding boxes |
| `data_inputs/dictionaries/subregion_dictionary.csv` | CSV | Subregion names, parent region, and bounding boxes |
| `data_inputs/styles/*.json` | MapLibre GL style JSON | Basemap and overlay styles (Positron, satellite, WDPA, etc.) |
| `data_inputs/colour_ramps/un_lcc_color_scheme.csv` | CSV | Land-use class colours (UN LCC scheme) for bar chart swatches |
| `data_inputs/website_assets/` | MP4, PNG | Splash screen video and logo |

### Outputs (`data_outputs/`)

| Path | Format | Purpose |
|------|--------|---------|
| `data_outputs/adm_bdry_info.json` | JSON | Country/ADM1 boundary metadata (bounding boxes, display names) |
| `data_outputs/raster_analysis/results_summary.json` | JSON | Metadata for all datasets — loaded at startup |
| `data_outputs/raster_analysis/results_{paddedId}_{stringId}.json` | JSON | Per-dataset chart data — lazy-loaded on the final screen |
| `data_outputs/raster_analysis/raster_tiles/SDM/{folder}/{paddedId}_{stringId}_zoom_auto/{z}/{x}/{y}.png` | PNG tiles | Raster tiles for species distribution models |

### Approved metadata (separate bucket)

Reviewed study-design and methodological-standards answers for each dataset live in a **separate** public bucket, not under `BUCKET_URL`:

```
APPROVED_METADATA_ROOT = https://wildcru-wildmaps-approved-775525057974-eu-west-2-an.s3.eu-west-2.amazonaws.com
```

One JSON file per dataset, `{file_label}.json` (e.g. `0002_burns_2025_Borneo_Asian_elephant.json`), with the same key structure as a `/survey` submission payload. These files are produced and uploaded from the **WildMaps-processing** repo (see its README) after a submission has been manually reviewed — they are not written by the live survey form itself, which posts to the separate, private submissions bucket via the survey Lambda. Fetched lazily per dataset by `AppContext.ensureApprovedMetadata`, cached in `AppContext.approvedMetadata`.

---

## S3 `test/` vs. root split

The bucket holds two parallel copies of `data_inputs/` and `data_outputs/` — one at the bucket root, one under a `test/` prefix. `VITE_USE_TESTING_PREFIX` (see `src/constants/mapConfig.ts`) picks which one the app reads from: `true` → `test/`, `false`/unset → root.

As of the last data sync, the two copies are **not** equivalent:
- Root's `data_outputs/raster_analysis/results_summary.json` and per-dataset detail files use an older naming scheme (`results_{string_id}.json`, no numeric `dataset_id`). `test/`'s copy uses the current scheme (`results_{paddedId}_{stringId}.json`, numeric `dataset_id` + separate `string_id` field) that `useDetailedData.ts` expects.
- `test/data_inputs/catalogs/` is missing `study_metadata_catalog.csv` on root.
- `test/data_inputs/styles/` was missing several basemap/overlay styles that root has (`esri_world_imagery`, `mapzen_elevation_and_hillshade`, `worldpop`, `landcover`, `ecoregions`, `wdpa`) — these were copied (not moved) from root into `test/` so the deployed site, now pointed at `test/`, has all basemap options working.

Root is currently **frozen** — another live deployment elsewhere reads from it directly, so it can't be overwritten or resynced without coordinating that separately. Until root is updated (or that other deployment is retired), the deployed WildMaps site stays pointed at `test/` via `.env.production.local`.

---

## Architecture notes

- **Selection state** is stored in URL search params via `useFilterState` — selections survive page refreshes and are shareable.
- **Two selection orderings** are supported: Region-first and Superspecies-first. `navigationUtils.ts` encodes both route sequences.
- **Map layers** are managed by `useMap.ts` in four named slots (bottom → top): `underlay` → `data` → `baselayer` → `overlay`. The map switches between globe (zoom < 4) and Mercator (zoom ≥ 4) projection automatically.
- **No Redux or Zustand** — context + URL params + hook-local state covers everything.
- **`SelectAdm0` and `SelectAdm1`** exist as pages but ADM selection is handled inline on `FinalScreen` instead.
- **`/survey`** is a standalone two-page submission form: page 1 collects study metadata (driven by `study_metadata_dictionary.csv`), page 2 is a fixed "Methodological standards" checklist (`constants/methodologicalStandards.ts`) that gives submitters a live Gold/Silver/Bronze quality estimate. Only the raw checklist answers are submitted (prefixed `standards.`), not the calculated score, plus a hidden `form_version` field.
- **Approved metadata**: once a submission is reviewed, WildMaps-processing publishes a JSON file per dataset to the approved-metadata bucket (see "Approved metadata (separate bucket)" above), which the website reads back — powering the Gold/Silver/Bronze medal (or ○ for unknown) on `SelectDataset`, and the "Study design and metadata" / "Methodological standard score" sections on `FinalScreen`. `methodologicalStandards.ts`'s `calculateChecklistResultFromPayload` reuses the same scoring logic the live form uses for its "Calculate score" preview.
