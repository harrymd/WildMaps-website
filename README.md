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
    mapConfig.ts       # BUCKET_URL and PATH_STYLES — single source of truth for S3 paths

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
    SelectAdm0.tsx, SelectAdm1.tsx  (exist but currently skipped in workflow)

  components/
    Layout.tsx          # Shell: two sidebars + centre map + router outlet
    MapContainer.tsx    # Wraps useMap; renders map canvas, logo
    Sidebar.tsx         # Reusable animated sidebar (left or right)
    BasemapControls/    # Right-sidebar UI + config for basemap/overlay options
    GeneralSelectComponent.tsx  # Reusable card-list selector used by most pages
    BarChart.tsx        # D3 stacked bar charts
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

## Architecture notes

- **Selection state** is stored in URL search params via `useFilterState` — selections survive page refreshes and are shareable.
- **Two selection orderings** are supported: Region-first and Superspecies-first. `navigationUtils.ts` encodes both route sequences.
- **Map layers** are managed by `useMap.ts` in four named slots (bottom → top): `underlay` → `data` → `baselayer` → `overlay`. The map switches between globe (zoom < 4) and Mercator (zoom ≥ 4) projection automatically.
- **No Redux or Zustand** — context + URL params + hook-local state covers everything.
- **`SelectAdm0` and `SelectAdm1`** exist as pages but ADM selection is handled inline on `FinalScreen` instead.
