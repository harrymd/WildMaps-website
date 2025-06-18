import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout />
      </Router>
    </AppProvider>
  );
}
