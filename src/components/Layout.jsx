import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import BasemapControls from './BasemapControls';
import Sidebar from './Sidebar';
import SidebarToggleButton from './SidebarToggleButton';
import MapContainer from './MapContainer';
import { Routes, Route } from 'react-router-dom';
//import { Routes, Route, Navigate } from 'react-router-dom';
//
import SelectStartingFilter from '../pages/SelectStartingFilter';
import SelectRegion from '../pages/SelectRegion';
import SelectSubRegion from '../pages/SelectSubRegion';
import SelectSuperSpecies from '../pages/SelectSuperSpecies';
import SelectSpecies from '../pages/SelectSpecies';

import SelectDataset from '../pages/SelectDataset';
import SelectAdm0 from '../pages/SelectAdm0';
import SelectAdm1 from '../pages/SelectAdm1';
import FinalScreen from '../pages/FinalScreen';

const sidebarWidth = 'min(50vw, 35rem)';

export default function Layout() {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(false);
  const { datasetKey } = useAppContext();
  const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
  const PATH_STYLES = `${BUCKET_URL}/data_inputs/styles`
  //  useState('style/liberty_underlay.json');
  const [layers, setLayers] = useState({
    underlay: {
      //url: 'style/liberty_underlay.json'
      //url: 'style/positron_underlay.json'
      url: `${PATH_STYLES}/positron_english_underlay.json`
    },
    overlay: {
      //url: 'style/liberty_overlay.json'
      //url: 'style/positron_overlay.json'
      url: `${PATH_STYLES}/positron_english_overlay.json`
    }
  });
  
  const transformStyle = `translateX(${
    showLeft && showRight
      ? '0'
      : showLeft
      ? `calc(${sidebarWidth} / 2)`
      : showRight
      ? `calc(-1 * ${sidebarWidth} / 2)`
      : '0'
  })`;

  return (
    <div className="relative w-screen h-screen font-sans overflow-hidden bg-blue-950">
      {!showLeft && (
        <SidebarToggleButton position="left" onClick={() => setShowLeft(true)} title="Choose a dataset to inspect" />
      )}
      {!showRight && (
        <SidebarToggleButton position="right" onClick={() => setShowRight(true)} title="Control basemap layers" />
      )}
  
      {/*
      <Sidebar title="Dataset browser" isOpen={showLeft} onClose={() => setShowLeft(false)} width={sidebarWidth}>
        <Routes>
          <Route path="/" element={<SelectDataset />} />
          <Route path="/:datasetKey" element={<SelectAdm0 />} />
          <Route path="/:datasetKey/:adm0Key" element={<SelectAdm1 />} />
          <Route path="/:datasetKey/:adm0Key/:adm1Key" element={<FinalScreen />} />
        </Routes>
      </Sidebar>
        */}
      <Sidebar title="Dataset browser" isOpen={showLeft} onClose={() => setShowLeft(false)} width={sidebarWidth}>
        <Routes>
          <Route path="/" element={<SelectStartingFilter />} />
          <Route path="/region" element={<SelectRegion />} />
          <Route path="/subregion" element={<SelectSubRegion />} />
          <Route path="/superspecies" element={<SelectSuperSpecies />} />
          <Route path="/species" element={<SelectSpecies />} />
          <Route path="/dataset" element={<SelectDataset />} />
          <Route path="/adm0" element={<SelectAdm0 />} />
          <Route path="/adm1" element={<SelectAdm1 />} />
          <Route path="/final" element={<FinalScreen />} />
          {/*<Route path="*" element={<Navigate to="/" replace />} />*/}
          {/*<Route path="/" element={<SelectStartingFilter />} />*/}
          {/*<Route path="/region" element={<SelectRegion />} />
          <Route path="/subregion" element={<SelectSubRegion />} />
          <Route path="/genus" element={<SelectGenus />} />
          <Route path="/species" element={<SelectSpecies />} />
          */}
          {/*<Route path="/dataset" element={<SelectDataset />} />
          <Route path="/adm0" element={<SelectAdm0 />} />
          <Route path="/adm1" element={<SelectAdm1 />} />
          <Route path="/final" element={<FinalScreen />} />*/}
        </Routes>
      </Sidebar>

      <BasemapControls
        isOpen={showRight}
        onClose={() => setShowRight(false)}
        layers={layers}
        setLayers={setLayers}
      />

      <MapContainer
        transformStyle={transformStyle}
        layers={layers}
        setLayers={setLayers}
      />
    </div>
  );
}
