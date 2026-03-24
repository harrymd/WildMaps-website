# WildMaps — Claude Code Context

## What this app does

WildMaps is an interactive web app for exploring habitat suitability maps for endangered species. Users follow a guided multi-step workflow to filter by region and/or species, then view the selected dataset rendered as raster tiles on an interactive map, alongside bar charts summarising habitat suitability and land use.

All data (raster tiles, map styles, metadata dictionaries, chart data) is served from an AWS S3 bucket — the app is entirely static/serverless.

---

## Stack

| Tool | Version |
|------|---------|
| React | 19.1 |
| MapLibre GL JS | 5.6 |
| React Router DOM | 7.6 |
| D3 | 7.9 |
| PapaParse | 5.5 |
| Vite | 6.3 |
| Tailwind CSS | 3.4 |
| Lucide React | icons |

**No TypeScript** — the project is plain JSX throughout.

---

## Project layout

```
src/
  App.jsx              # Root: loading screen, tutorial overlay, provider/router setup
  main.jsx             # ReactDOM.createRoot entry point
  index.css            # Tailwind directives only (@tailwind base/components/utilities)

  context/
    AppContext.jsx      # Global state: all S3 data loaded here on startup

  constants/
    mapConfig.js        # BUCKET_URL and PATH_STYLES — single source of truth for S3 paths

  hooks/
    useMap.js           # Core MapLibre hook: init, layer management, projection switching
    useLayerState.js    # Visibility state for data/overlay/baselayer
    useFilterState.js   # URL search-param state (replaces useState for selections)
    useDatasetInfo.js   # Derives current dataset key + scale from URL params
    useDetailedData.jsx # Lazy-loads per-dataset JSON from S3 on final screen
    useLocationSelection.jsx  # ADM0/ADM1 option lists + map panning
    useUpdateMapOnDatasetChange.js  # Adds raster tile layer when dataset changes
    useMapPanning.js    # Dispatches pan events from pages
    useDefaultMapPanning.js   # Pan-on-mount to default view

  pages/               # One component per step in the selection workflow
    SelectStartingFilter.jsx  → / (choose Region-first or Species-first)
    SelectRegion.jsx          → /region
    SelectSubRegion.jsx       → /subregion
    SelectSuperSpecies.jsx    → /superspecies
    SelectSpecies.jsx         → /species
    SelectDataset.jsx         → /dataset
    FinalScreen.jsx           → /final
    SelectAdm0.jsx, SelectAdm1.jsx  (exist but currently skipped in workflow)

  components/
    Layout.jsx          # Shell: two sidebars + centre map + router outlet
    MapContainer.jsx    # Wraps useMap; renders map canvas, logo
    Sidebar.jsx         # Reusable animated sidebar (left or right)
    BasemapControls/    # Right-sidebar UI + config.js for basemap/overlay options
    GeneralSelectComponent.jsx  # Reusable card-list selector used by most pages
    BarChart.jsx        # D3 stacked bar charts
    *Legend.jsx / *ColorBar.jsx  # Map legend components

  utils/
    mapPanningUtils.js  # pan helpers: fitBounds, flyTo, or event-based
    navigationUtils.jsx # getNextRoute / getPreviousRoute for both workflow orderings
    chartDataUtils.js   # Transforms raw dataset JSON into D3-ready chart data
```

---

## State management

- **Global data** lives in `AppContext` (loaded once from S3 on app start).
- **Selection state** (which region, species, dataset, etc.) is stored in **URL search params** via `useFilterState` — this means selections survive page refreshes and are shareable.
- **Map state** is owned by the `useMap` hook and communicated to map controls via prop callbacks and custom `window` events (e.g. `'panToLocation'`).
- No Redux, Zustand, or similar — context + URL params + hook-local state covers everything.

---

## Map layers

`useMap.js` manages four named layer slots, rendered in this order (bottom → top):

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

data_inputs/dictionaries/   — CSV lookups (species, superspecies, regions, subregions)
data_inputs/styles/         — MapLibre style JSON files
data_inputs/colour_ramps/   — Land use colour scheme CSV
data_inputs/website_assets/ — Splash video, logo

data_outputs/adm_bdry_info.json            — Country/region boundary metadata
data_outputs/raster_analysis/
  results_summary.json                     — All dataset metadata (loaded at startup)
  results_{datasetKey}.json                — Per-dataset detail (lazy-loaded on FinalScreen)
  raster_tiles/SDM/{folder}/{key}_zoom_auto/{z}/{x}/{y}.png
```

---

## Development

```bash
npm run dev      # Vite dev server
npm run build    # Production build → dist/
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test suite currently.

---

## Things worth knowing

- **Two selection orderings** are supported: Region-first and Superspecies-first. `navigationUtils.jsx` encodes both route sequences.
- **`SelectAdm0` and `SelectAdm1`** exist as pages but are not wired into the navigation workflow — ADM selection happens inside `FinalScreen` instead.
- **`src/old/`** is gitignored — legacy files kept locally, not tracked.
- The app currently has no test suite.
- `BarChart.jsx` uses imperative D3 DOM manipulation inside a `useEffect` — take care when re-rendering.
- All S3 assets are public; there is no auth layer.
