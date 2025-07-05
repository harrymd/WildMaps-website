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
  const [fadeOut, setFadeOut] = useState(false);
  const BUCKET_URL = 'https://wildcru-wildmaps.s3.eu-west-2.amazonaws.com';
  const PATH_VIDEO = `${BUCKET_URL}/data_inputs/website_assets/splash_page_animation.mp4`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setFadeOut(true);
      // Wait for fade animation to complete before calling onVideoEnd
      setTimeout(() => {
        onVideoEnd();
      }, 1000);
    };

    const handleVideoError = () => {
      setVideoError(true);
      // If video fails to load, wait 2 seconds then proceed
      setTimeout(() => {
        handleVideoEnd();
      }, 2000);
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('error', handleVideoError);

    // Set playback speed (0.5 = half speed, 2.0 = double speed)
    //video.playbackRate = 5.0; // Adjust this value as needed
    video.playbackRate = 1.0; // Adjust this value as needed
    
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
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
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

// Tutorial Overlay Component
function TutorialOverlay({ step, onNext, onComplete }) {
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      console.log(showCheckbox, isChecked, step);
      e.preventDefault();
      if (step < 4) {
        onNext();
      } else if (showCheckbox && isChecked) {
        onComplete();
      }
    }
  };

  const handleClick = (e) => {
    // Don't trigger if clicking on interactive elements
    console.log(showCheckbox, isChecked, step);
    if (e.target.type === 'checkbox') return;
    
    if (step < 4) {
      onNext();
    } else if (showCheckbox && isChecked) {
      onComplete();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [step, showCheckbox, isChecked]);

  useEffect(() => {
    if (step === 4) {
      setShowCheckbox(true);
    }
  }, [step]);

  const getStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to WildMaps!</h2>
            <p>Welcome to WildMaps — an interactive platform for visualising, exploring, and downloading habitat suitability maps for species of conservation concern.</p>
            <p>All maps on this platform have been published in peer-reviewed scientific journals. We encourage users to consult the original articles (linked if open access) or contact the corresponding authors when needed (email address provided).</p>
          </div>
        );
      case 1:
        return null; // Text will be shown over the sidebar
      case 2:
        return null; // Text will be shown next to the button
      case 3:
        return null; // Text will be shown over the map
      case 4:
        return null; // Text will be shown over the map
      case 5:
        return null; // Checkbox will be shown
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-40 bg-black bg-opacity-50 flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      {/* Top instruction bar */}
      <div className="bg-blue-600 text-white text-center py-3 px-4 absolute bottom-0 left-0 right-0">
        <p className="text-lg font-semibold">
          {step < 4 ? 'Press space/enter or click to continue' : 'Check the box and click to finish'}
        </p>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        {step === 0 && (
          <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-2xl">
            {getStepContent()}
          </div>
        )}
      </div>

      {/* Sidebar overlay text */}
      {step === 1 && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black p-4 rounded-lg shadow-lg max-w-xs z-50">
          <p className="font-semibold">This is where you choose a dataset to visualise</p>
        </div>
      )}

      {/* Basemap controls overlay text */}
      {step === 2 && (
        <div className="absolute right-4 top-20 bg-yellow-400 text-black p-4 rounded-lg shadow-lg max-w-xs z-50">
          <p className="font-semibold">Click here to open up the map controls</p>
        </div>
      )}

      {/* Map overlay text */}
      {(step === 3) && (
        <div className="absolute inset-0 flex items-center justify-center z-50 transform translate-x-20">
          <div className="bg-yellow-400 text-black p-6 rounded-lg shadow-lg max-w-md text-center">
            <p className="font-semibold text-lg">This is where the data will be shown</p>
          </div>
        </div>
      )}

      {/* Checkbox overlay */}
      {step >= 4 && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <p>Please note: We are not responsible for any onward use of the maps provided.</p>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-lg font-semibold">I understand and agree with the terms above.</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const handleVideoEnd = () => {
    setIsLoading(false);
    setShowTutorial(true);
  };

  const handleTutorialNext = () => {
    setTutorialStep(prev => prev + 1);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  return (
    <AppProvider>
      <Router>
        {isLoading ? (
          <LoadingScreen 
            onVideoEnd={handleVideoEnd}
            backgroundColor="#f5eeee"
          />
        ) : (
          <>
            <Layout 
              tutorialActive={showTutorial}
              tutorialStep={tutorialStep}
            />
            {showTutorial && (
              <TutorialOverlay
                step={tutorialStep}
                onNext={handleTutorialNext}
                onComplete={handleTutorialComplete}
              />
            )}
          </>
        )}
      </Router>
    </AppProvider>
  );
}
