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

export default function Layout() {
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

  return (
    <div className="relative w-screen h-screen font-sans overflow-hidden bg-blue-950">
      {!showLeft && (
        <SidebarToggleButton
          position="left"
          onClick={() => setShowLeft(true)}
          title="Choose a dataset to inspect"
          Icon={BarChart3}
        />
      )}
      {!showRight && (
        <SidebarToggleButton position="right" onClick={() => setShowRight(true)} title="Control basemap layers" />
      )}

      <Sidebar title="Dataset browser" isOpen={showLeft} onClose={() => setShowLeft(false)} width={leftSidebarWidth}>
        <Routes>
          <Route path="/" element={<SelectStartingFilter />} />
          <Route path="/region" element={<SelectRegion />} />
          <Route path="/subregion" element={<SelectSubRegion />} />
          <Route path="/superspecies" element={<SelectSuperSpecies />} />
          <Route path="/species" element={<SelectSpecies />} />
          <Route path="/dataset" element={<SelectDataset />} />
          <Route path="/final" element={<FinalScreen />} />
        </Routes>
      </Sidebar>

      <BasemapControls
        isOpen={showRight}
        onClose={() => setShowRight(false)}
        layers={layers}
        setLayers={setLayers}
        width={rightSidebarWidth}
      />

      <MapContainer
        transformStyle={transformStyle}
        layers={layers}
        setLayers={setLayers}
        showLeft={showLeft}
        showRight={showRight}
      />
    </div>
  );
}
