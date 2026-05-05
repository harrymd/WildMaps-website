import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import SurveyPage from './pages/SurveyPage';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BUCKET_URL } from './constants/mapConfig';

const PATH_VIDEO = `${BUCKET_URL}/data_inputs/website_assets/splash_page_animation.mp4`;

// ─── Loading Screen ───────────────────────────────────────────────────────────

interface LoadingScreenProps {
  onVideoEnd: () => void;
  backgroundColor?: string;
}

/**
 * Full-screen splash that plays an intro video, then fades out.
 * If the video fails to load it waits 2 s before calling onVideoEnd.
 */
function LoadingScreen({ onVideoEnd, backgroundColor = '#f5eeee' }: LoadingScreenProps) {
  const videoRef                      = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError]   = useState(false);
  const [fadeOut,    setFadeOut]      = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const triggerEnd = () => {
      setFadeOut(true);
      setTimeout(onVideoEnd, 1000); // wait for CSS fade before unmounting
    };

    const handleError = () => {
      setVideoError(true);
      setTimeout(triggerEnd, 2000);
    };

    video.addEventListener('ended', triggerEnd);
    video.addEventListener('error', handleError);
    video.playbackRate = 2.0;
    video.play().catch((err) => {
      console.warn('Video autoplay failed:', err);
      handleError();
    });

    return () => {
      video.removeEventListener('ended', triggerEnd);
      video.removeEventListener('error', handleError);
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

// ─── Tutorial Overlay ─────────────────────────────────────────────────────────

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onComplete: () => void;
}

/**
 * Semi-transparent overlay that walks the user through the interface.
 * Steps 1-3 show contextual call-out boxes next to the relevant UI.
 * Step 4 shows a disclaimer checkbox the user must accept to proceed.
 */
function TutorialOverlay({ step, onNext, onComplete }: TutorialOverlayProps) {
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [isChecked,    setIsChecked]    = useState(false);

  const advance = () => {
    if (step < 4) {
      onNext();
    } else if (showCheckbox && isChecked) {
      onComplete();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      advance();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).getAttribute('type') === 'checkbox') return;
    advance();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [step, showCheckbox, isChecked]);

  useEffect(() => {
    if (step === 4) setShowCheckbox(true);
  }, [step]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      {/* Bottom instruction bar */}
      <div className="bg-blue-600 text-white text-center py-3 px-4 absolute bottom-0 left-0 right-0">
        <p className="text-lg font-semibold">
          {step < 4 ? 'Press space/enter or click to continue' : 'Check the box and click to finish'}
        </p>
      </div>

      {/* Step 0: welcome panel */}
      <div className="flex-1 flex items-center justify-center">
        {step === 0 && (
          <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Welcome to WildMaps!</h2>
            <p>
              Welcome to WildMaps — an interactive platform for visualising, exploring, and
              downloading habitat suitability maps for species of conservation concern.
            </p>
            <p>
              All maps on this platform have been published in peer-reviewed scientific journals.
              We encourage users to consult the original articles (linked if open access) or
              contact the corresponding authors when needed (email address provided).
            </p>
          </div>
        )}
      </div>

      {/* Step 1: sidebar call-out */}
      {step === 1 && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black p-4 rounded-lg shadow-lg max-w-xs z-50">
          <p className="font-semibold">This is where you choose a dataset to visualise</p>
        </div>
      )}

      {/* Step 2: basemap controls call-out */}
      {step === 2 && (
        <div className="absolute right-4 top-20 bg-yellow-400 text-black p-4 rounded-lg shadow-lg max-w-xs z-50">
          <p className="font-semibold">Click here to open up the map controls</p>
        </div>
      )}

      {/* Step 3: map area call-out */}
      {step === 3 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 transform translate-x-20">
          <div className="bg-yellow-400 text-black p-6 rounded-lg shadow-lg max-w-md text-center">
            <p className="font-semibold text-lg">This is where the data will be shown</p>
          </div>
        </div>
      )}

      {/* Step 4: disclaimer checkbox */}
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
              <span className="text-lg font-semibold">
                I understand and agree with the terms above.
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main app (with loading screen + tutorial) ────────────────────────────────

function MainApp() {
  const [isLoading,    setIsLoading]    = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const handleVideoEnd = () => {
    setIsLoading(false);
    setShowTutorial(true);
  };

  return (
    <AppProvider>
      {isLoading ? (
        <LoadingScreen onVideoEnd={handleVideoEnd} backgroundColor="#f5eeee" />
      ) : (
        <>
          <Layout tutorialActive={showTutorial} tutorialStep={tutorialStep} />
          {showTutorial && (
            <TutorialOverlay
              step={tutorialStep}
              onNext={() => setTutorialStep((s) => s + 1)}
              onComplete={() => { setShowTutorial(false); setTutorialStep(0); }}
            />
          )}
        </>
      )}
    </AppProvider>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

/** Routes /survey directly to the standalone form; all other paths go through the main app. */
function AppContent() {
  const location = useLocation();
  if (location.pathname === '/survey') return <SurveyPage />;
  return <MainApp />;
}

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  );
}
