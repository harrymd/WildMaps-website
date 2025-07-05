import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
//import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

// Loading Screen Component
function LoadingScreen({ onVideoEnd, backgroundColor = '#f5eeee' }) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
  const PATH_VIDEO = `${BUCKET_URL}/data_inputs/website_assets/splash_page_animation.mp4`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      onVideoEnd();
    };

    const handleVideoError = () => {
      setVideoError(true);
      // If video fails to load, wait 2 seconds then proceed
      setTimeout(() => {
        onVideoEnd();
      }, 2000);
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('error', handleVideoError);

    video.playbackRate = 0.75; // Adjust this value as needed

    // Auto-play the video
    video.play().catch((error) => {
      console.warn('Video autoplay failed:', error);
      handleVideoError();
    });

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('error', handleVideoError);
    };
  }, [onVideoEnd]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor }}
    >
      {!videoError ? (
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain"
          muted
          playsInline
          preload="auto"
        >
          <source src={PATH_VIDEO} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  return (
    <AppProvider>
      <Router>
        {isLoading ? (
          <LoadingScreen 
            onVideoEnd={handleVideoEnd}
            backgroundColor="#f5eeee" // You can customize this color
          />
        ) : (
          <Layout />
        )}
      </Router>
    </AppProvider>
  );
}
