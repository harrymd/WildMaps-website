import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import BasemapControls from './BasemapControls/BasemapControls';
import Sidebar from './Sidebar';
import SidebarToggleButton from './SidebarToggleButton';
import MapContainer from './MapContainer';
import SelectStartingFilter from '../pages/SelectStartingFilter';
import SelectRegion from '../pages/SelectRegion';
import SelectSubRegion from '../pages/SelectSubRegion';
import SelectSuperSpecies from '../pages/SelectSuperSpecies';
import SelectSpecies from '../pages/SelectSpecies';
import SelectDataset from '../pages/SelectDataset';
import FinalScreen from '../pages/FinalScreen';
import type { LayersMap } from '../types';
import { PATH_STYLES } from '../constants/mapConfig';

// Tutorial highlight states per component
type TutorialComponent = 'sidebar' | 'basemapButton' | 'map';

/** Step number at which each component becomes interactive. */
const TUTORIAL_UNLOCK_STEP: Record<TutorialComponent, number> = {
  sidebar:      1,
  basemapButton: 2,
  map:          5,
};

interface LayoutProps {
  tutorialActive?: boolean;
  tutorialStep?: number;
}

/** Main application shell: left dataset-browser sidebar, right basemap-controls sidebar, and map. */
export default function Layout({ tutorialActive = false, tutorialStep = 0 }: LayoutProps) {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(false);

  const [layers, setLayers] = useState<LayersMap>({
    underlay: { url: `${PATH_STYLES}/positron_english_underlay.json` },
    overlay:  { url: `${PATH_STYLES}/positron_english_overlay.json` },
  });

  const leftSidebarWidth  = 'min(50vw, 35rem)';
  const rightSidebarWidth = 'min(30vw, 21rem)';

  /** CSS transform that shifts the map centre when one or both sidebars are open. */
  const transformStyle = `translateX(${
    showLeft && showRight
      ? '0'
      : showLeft
      ? `calc(${leftSidebarWidth} / 2)`
      : showRight
      ? `calc(-1 * ${rightSidebarWidth} / 2)`
      : '0'
  })`;

  // ── Tutorial helpers ──────────────────────────────────────────────────────

  const isLocked = (component: TutorialComponent) =>
    tutorialActive && tutorialStep < TUTORIAL_UNLOCK_STEP[component];

  const getTutorialClasses = (component: TutorialComponent) => {
    const classes: string[] = [];
    if (isLocked(component)) classes.push('opacity-30', 'pointer-events-none');
    return classes.join(' ');
  };

  return (
    <div className="relative w-screen h-screen font-sans overflow-hidden bg-blue-950">
      {/* Floating buttons to reopen closed sidebars */}
      {!showLeft && (
        <SidebarToggleButton
          position="left"
          onClick={() => !isLocked('sidebar') && setShowLeft(true)}
          title="Choose a dataset to inspect"
          Icon={BarChart3}
          className={getTutorialClasses('sidebar')}
        />
      )}
      {!showRight && (
        <SidebarToggleButton
          position="right"
          onClick={() => !isLocked('basemapButton') && setShowRight(true)}
          title="Control basemap layers"
          className={getTutorialClasses('basemapButton')}
        />
      )}

      {/* Left sidebar — dataset browser */}
      <Sidebar
        title="Dataset browser"
        isOpen={showLeft}
        onClose={() => !isLocked('sidebar') && setShowLeft(false)}
        width={leftSidebarWidth}
        className={getTutorialClasses('sidebar')}
      >
        <Routes>
          <Route path="/"           element={<SelectStartingFilter />} />
          <Route path="/region"     element={<SelectRegion />} />
          <Route path="/subregion"  element={<SelectSubRegion />} />
          <Route path="/superspecies" element={<SelectSuperSpecies />} />
          <Route path="/species"    element={<SelectSpecies />} />
          <Route path="/dataset"    element={<SelectDataset />} />
          <Route path="/final"      element={<FinalScreen />} />
        </Routes>
      </Sidebar>

      {/* Right sidebar — basemap controls */}
      <BasemapControls
        isOpen={showRight}
        onClose={() => !isLocked('basemapButton') && setShowRight(false)}
        layers={layers}
        setLayers={setLayers}
        width={rightSidebarWidth}
        className={getTutorialClasses('basemapButton')}
      />

      {/* Map canvas */}
      <MapContainer
        transformStyle={transformStyle}
        layers={layers}
        setLayers={setLayers}
        showLeft={showLeft}
        showRight={showRight}
        className={getTutorialClasses('map')}
      />
    </div>
  );
}
