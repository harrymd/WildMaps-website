import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import BasemapControls from './BasemapControls/BasemapControls';
import Sidebar from './Sidebar';
import SidebarToggleButton from './SidebarToggleButton';
import MapContainer from './MapContainer';
import { Routes, Route } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

import SelectStartingFilter from '../pages/SelectStartingFilter';
import SelectRegion from '../pages/SelectRegion';
import SelectSubRegion from '../pages/SelectSubRegion';
import SelectSuperSpecies from '../pages/SelectSuperSpecies';
import SelectSpecies from '../pages/SelectSpecies';
import SelectDataset from '../pages/SelectDataset';
import SelectAdm0 from '../pages/SelectAdm0';
import SelectAdm1 from '../pages/SelectAdm1';
import FinalScreen from '../pages/FinalScreen';

export default function Layout({ tutorialActive = false, tutorialStep = 0 }) {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(false);
  const { datasetKey } = useAppContext();
  const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
  const PATH_STYLES = `${BUCKET_URL}/data_inputs/styles`
  
  const [layers, setLayers] = useState({
    underlay: {
      url: `${PATH_STYLES}/positron_english_underlay.json`
    },
    overlay: {
      url: `${PATH_STYLES}/positron_english_overlay.json`
    }
  });
 
  const leftSidebarWidth = 'min(50vw, 35rem)';
  const rightSidebarWidth = 'min(30vw, 21rem)';
  
  const transformStyle = `translateX(${
    showLeft && showRight
      ? '0'
      : showLeft
      ? `calc(${leftSidebarWidth} / 2)`
      : showRight
      ? `calc(-1 * ${rightSidebarWidth} / 2)`
      : '0'
  })`;

  // Determine which components should be greyed out based on tutorial step
  const shouldGreyOut = (component) => {
    if (!tutorialActive) return false;
    
    switch (component) {
      case 'sidebar':
        return tutorialStep < 1;
      case 'basemapButton':
        return tutorialStep < 2;
      case 'map':
        return tutorialStep < 5; // Keep map greyed until final step
      default:
        return false;
    }
  };

  // Determine if interactions should be disabled
  const shouldDisableInteractions = (component) => {
    if (!tutorialActive) return false;
    
    switch (component) {
      case 'sidebar':
        return tutorialStep < 1;
      case 'basemapButton':
        return tutorialStep < 2;
      case 'map':
        return tutorialStep < 5;
      default:
        return false;
    }
  };

  // Helper function to get tutorial classes
  const getTutorialClasses = (component) => {
    const classes = [];
    if (shouldGreyOut(component)) classes.push('opacity-30');
    if (shouldDisableInteractions(component)) classes.push('pointer-events-none');
    return classes.join(' ');
  };

  return (
    <div className="relative w-screen h-screen font-sans overflow-hidden bg-blue-950">
      {!showLeft && (
        <SidebarToggleButton
          className={getTutorialClasses('basemapButton')}
          position="left"
          onClick={() => !shouldDisableInteractions('sidebar') && setShowLeft(true)}
          title="Choose a dataset to inspect"
          Icon={BarChart3}
        />
      )}
      
      {!showRight && (
        <SidebarToggleButton 
          className={getTutorialClasses('basemapButton')}
          position="right" 
          onClick={() => !shouldDisableInteractions('basemapButton') && setShowRight(true)} 
          title="Control basemap layers" 
        />
      )}

      <Sidebar 
        className={getTutorialClasses('sidebar')}
        title="Dataset browser" 
        isOpen={showLeft} 
        onClose={() => !shouldDisableInteractions('sidebar') && setShowLeft(false)} 
        width={leftSidebarWidth}
      >
        {/*<!--<div className={shouldDisableInteractions('sidebar') ? 'pointer-events-none' : ''}>*/}
          <Routes>
            <Route path="/" element={<SelectStartingFilter />} />
            <Route path="/region" element={<SelectRegion />} />
            <Route path="/subregion" element={<SelectSubRegion />} />
            <Route path="/superspecies" element={<SelectSuperSpecies />} />
            <Route path="/species" element={<SelectSpecies />} />
            <Route path="/dataset" element={<SelectDataset />} />
            <Route path="/final" element={<FinalScreen />} />
          </Routes>
        {/*</div>*/}
      </Sidebar>

      <BasemapControls
        isOpen={showRight}
        onClose={() => !shouldDisableInteractions('basemapButton') && setShowRight(false)}
        layers={layers}
        setLayers={setLayers}
        width={rightSidebarWidth}
        className={getTutorialClasses('basemapButton')}
      />

      <MapContainer
        className={getTutorialClasses('map')}
        transformStyle={transformStyle}
        layers={layers}
        setLayers={setLayers}
        showLeft={showLeft}
        showRight={showRight}
      />
    </div>
  );
}
