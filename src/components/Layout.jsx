import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Sidebar from './Sidebar';
import SidebarToggleButton from './SidebarToggleButton';
import MapContainer from './MapContainer';
import { Routes, Route } from 'react-router-dom';
import SelectDataset from '../pages/SelectDataset';
import SelectAdm0 from '../pages/SelectAdm0';
import SelectAdm1 from '../pages/SelectAdm1';
import FinalScreen from '../pages/FinalScreen';

const sidebarWidth = 'min(50vw, 35rem)';

export default function Layout() {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const { datasetKey } = useAppContext();
  //const subfolder = datasetKey ? datasetKey.slice(0, 3) : null;
  const datasetSubFolder = "burns_2025";
  const datasetZoomStr = '06';

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
    <div className="relative w-screen h-screen font-sans overflow-hidden">
      {!showLeft && (
        <SidebarToggleButton position="left" onClick={() => setShowLeft(true)} title="Control habitat layers" />
      )}
      {!showRight && (
        <SidebarToggleButton position="right" onClick={() => setShowRight(true)} title="Control basemap layers" />
      )}

      <Sidebar title="Habitat Layers" isOpen={showLeft} onClose={() => setShowLeft(false)} width={sidebarWidth}>
        <Routes>
          <Route path="/" element={<SelectDataset />} />
          <Route path="/:datasetKey" element={<SelectAdm0 />} />
          <Route path="/:datasetKey/:adm0Key" element={<SelectAdm1 />} />
          <Route path="/:datasetKey/:adm0Key/:adm1Key" element={<FinalScreen />} />
        </Routes>
      </Sidebar>

      <Sidebar title="Basemap Layers" isOpen={showRight} onClose={() => setShowRight(false)} side="right" width={sidebarWidth}>
        <p className="text-gray-700">Right sidebar content placeholder.</p>
      </Sidebar>

      <MapContainer transformStyle={transformStyle}
        datasetKey = {datasetKey}
        datasetSubFolder = {datasetSubFolder}
        datasetZoomStr = {datasetZoomStr}
      />
    </div>
  );
}
