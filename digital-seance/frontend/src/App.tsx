import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { ModelStatusBanner } from './components/ModelStatusBanner';
import { FinalWhisperModal } from './components/FinalWhisperModal';
import { LandingPage } from './pages/LandingPage';
import { SeanceStudio } from './pages/SeanceStudio';
import { HauntedArchive } from './pages/HauntedArchive';
import { StoryDetails } from './pages/StoryDetails';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import type { ModelStatus } from './types';
import { api } from './services/api';

export function App() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isWhisperOpen, setIsWhisperOpen] = useState(false);

  const fetchModelStatus = async () => {
    try {
      const data = await api.getModelStatus();
      setModelStatus(data);
    } catch {
      // Offline / connecting
      setModelStatus({
        model_id: 'Qwen/Qwen2.5-3B-Instruct',
        is_loaded: false,
        status: 'unloaded',
        device: 'unknown',
        dtype: 'unknown',
        generation_available: false,
        error_message: 'Backend API connection pending or model unloaded.',
        max_new_tokens: 700,
      });
    }
  };

  useEffect(() => {
    fetchModelStatus();
    // Poll status periodically (every 10s) to reflect weight loading progress
    const interval = setInterval(fetchModelStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen flex flex-col bg-[#08090D] text-[#F5F3FF]">
        {/* Procedural Atmospheric Fog, Embers, and Gradients */}
        <AtmosphericBackground />

        {/* Global Model Status Header Banner */}
        <ModelStatusBanner
          status={modelStatus}
          onRefresh={fetchModelStatus}
        />

        {/* Primary Gothic Navigation Bar */}
        <Navbar
          modelStatus={modelStatus}
          onOpenWhisper={() => setIsWhisperOpen(true)}
        />

        {/* Main Content Router */}
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage onOpenWhisper={() => setIsWhisperOpen(true)} />} />
            <Route
              path="/studio"
              element={
                <SeanceStudio
                  modelStatus={modelStatus}
                  onRefreshModel={fetchModelStatus}
                />
              }
            />
            <Route path="/archive" element={<HauntedArchive />} />
            <Route path="/archive/:id" element={<StoryDetails />} />
            <Route
              path="/settings"
              element={
                <Settings
                  modelStatus={modelStatus}
                  onRefreshModel={fetchModelStatus}
                />
              }
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Supernatural Ambient Footer */}
        <Footer />

        {/* The Final Whisper Global Interactive Modal */}
        <FinalWhisperModal
          isOpen={isWhisperOpen}
          onClose={() => setIsWhisperOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
