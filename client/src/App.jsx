import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { RestorationControls } from './components/RestorationControls';
import { DualFramePreview } from './components/DualFramePreview';
import { HistoryList } from './components/HistoryList';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import { Sparkles, AlertCircle } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('enhance'); // 'enhance' | 'history'
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [mode, setMode] = useState('upscale'); // 'upscale' | 'deblur' | 'historical'
  const [isProcessing, setIsProcessing] = useState(false);
  const [restoredResult, setRestoredResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [samples, setSamples] = useState([]);
  const [history, setHistory] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch samples and history on load
  const loadData = async () => {
    try {
      const [sRes, hRes] = await Promise.all([
        api.getSamples().catch(() => ({ samples: [] })),
        api.getHistory().catch(() => ({ history: [] }))
      ]);
      if (sRes?.samples) setSamples(sRes.samples);
      if (hRes?.history) setHistory(hRes.history);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSampleSelected = (sample) => {
    setSelectedSample(sample);
    setSelectedImage(null);
    setMode(sample.recommendedMode || 'upscale');
    setErrorMsg(null);
  };

  const handleImageSelected = (imgData) => {
    setSelectedImage(imgData);
    setSelectedSample(null);
    setErrorMsg(null);
  };

  const handleClearSelection = () => {
    setSelectedImage(null);
    setSelectedSample(null);
  };

  // Run enhancement
  const handleExecute = async () => {
    if (!selectedImage && !selectedSample) {
      setErrorMsg('Please upload a photo or pick a sample photo.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    if (selectedImage?.file) {
      formData.append('image', selectedImage.file);
    } else if (selectedSample?.filename) {
      formData.append('sampleFilename', selectedSample.filename);
    }

    formData.append('mode', mode);
    formData.append('scale', 2);
    formData.append('sharpness', 2.0);

    try {
      const res = await api.restoreImage(formData);
      if (res.success && res.data) {
        setRestoredResult(res.data);
        // Refresh history list
        api.getHistory().then((hRes) => {
          if (hRes?.history) setHistory(hRes.history);
        });
      } else {
        setErrorMsg(res.error || 'Enhancement failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setRestoredResult(null);
    setSelectedImage(null);
    setSelectedSample(null);
    setErrorMsg(null);
  };

  const handleSelectFromHistory = (item) => {
    setRestoredResult({
      id: item._id || item.id,
      originalUrl: item.originalUrl,
      restoredUrl: item.restoredUrl,
      metrics: item.metrics,
      mode: item.mode,
      scaleFactor: item.scaleFactor || 2
    });
    setActiveTab('enhance');
  };

  const handleDeleteHistory = async (id) => {
    try {
      await api.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (restoredResult?.id === id) {
        handleReset();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const hasSelection = !!(selectedImage || selectedSample);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Simple Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Project Title & Description */}
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <span>AI Image Enhancement & Restoration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            A simple student-made web tool to upscale low-resolution images, deblur photos, and restore vintage prints using Hugging Face vision networks.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-800 rounded text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: ENHANCE STUDIO */}
        {activeTab === 'enhance' && (
          <div>
            {restoredResult ? (
              /* Dual Frame Preview Dashboard */
              <div className="space-y-4">
                <DualFramePreview
                  originalUrl={restoredResult.originalUrl}
                  restoredUrl={restoredResult.restoredUrl}
                  metrics={restoredResult.metrics}
                  mode={restoredResult.mode}
                  scaleFactor={restoredResult.scaleFactor}
                  onReset={handleReset}
                />
              </div>
            ) : (
              /* Simple Form: Upload + Task Selection */
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <ImageUploader
                    selectedImage={selectedImage}
                    selectedSample={selectedSample}
                    onImageSelected={handleImageSelected}
                    onSampleSelected={handleSampleSelected}
                    onClearSelection={handleClearSelection}
                    samples={samples}
                  />
                </div>

                <RestorationControls
                  mode={mode}
                  setMode={setMode}
                  isProcessing={isProcessing}
                  onExecute={handleExecute}
                  canExecute={hasSelection}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <HistoryList
            history={history}
            onSelectRestoration={handleSelectFromHistory}
            onDeleteRestoration={handleDeleteHistory}
            onGoToStudio={() => setActiveTab('enhance')}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-8 text-center text-xs text-slate-500">
        <p>
          Final Year Student Project • React.js, Node.js, Express, MongoDB, Hugging Face API
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
