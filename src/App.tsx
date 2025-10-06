import React, { useState, useCallback } from 'react';
import WineLabelUpload from './components/WineLabelUpload/WineLabelUpload.tsx';
import WineInfo from './components/WineInfo/WineInfo.tsx';
import TastingNotes from './components/TastingNotes/TastingNotes.tsx';
import UserHistory from './components/UserHistory/UserHistory.tsx';
import { WineRecognitionService } from './services/WineRecognitionService.ts';
import UserDataService from './services/UserDataService.ts';
import { Wine, WineSearchResult } from './types/Wine.ts';
import './App.css';

type AppState = 'upload' | 'results' | 'history';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResult, setSearchResult] = useState<WineSearchResult | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [userNotes, setUserNotes] = useState<{ [wineId: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // 新增：存储上传的图片URL

  const handleImageUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    // 创建图片URL用于显示
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);

    try {
      const result = await WineRecognitionService.analyzeWineLabel(file);
      setSearchResult(result);

      if (result.wine) {
        setSelectedWine(result.wine);
        UserDataService.addToHistory(result.wine, result.confidence);
        setCurrentState('results');
      } else {
        setError('Could not identify this wine. Please try a clearer image or different angle.');
      }
    } catch (err) {
      console.error('Wine recognition failed:', err);
      setError('Failed to analyze the wine label. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleAddToFavorites = useCallback((wine: Wine) => {
    const success = UserDataService.addToFavorites(wine, userNotes[wine.id]);
    if (success) {
      alert('Wine added to favorites!');
    } else {
      alert('This wine is already in your favorites.');
    }
  }, [userNotes]);

  const handleShare = useCallback((wine: Wine) => {
    if (navigator.share) {
      navigator.share({
        title: `${wine.name} - ${wine.producer}`,
        text: `Check out this ${wine.vintage} ${wine.name} from ${wine.producer}. Rated ${wine.rating}/100!`,
        url: window.location.href
      });
    } else {
      const shareText = `${wine.name} (${wine.vintage}) by ${wine.producer} - Rated ${wine.rating}/100`;
      navigator.clipboard.writeText(shareText);
      alert('Wine details copied to clipboard!');
    }
  }, []);

  const handleSaveUserNotes = useCallback((wineId: string, notes: string) => {
    setUserNotes(prev => ({ ...prev, [wineId]: notes }));
  }, []);

  const handleWineSelect = useCallback((wine: Wine) => {
    setSelectedWine(wine);
    setSearchResult({ wine, confidence: 100, extractedText: '' });
    setCurrentState('results');
  }, []);

  const handleNewScan = useCallback(() => {
    setCurrentState('upload');
    setSearchResult(null);
    setSelectedWine(null);
    setError(null);

    // 清理之前的图片URL以防止内存泄漏
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
      setUploadedImageUrl(null);
    }
  }, [uploadedImageUrl]);

  const handleViewHistory = useCallback(() => {
    setCurrentState('history');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <h1>🍷 Wine Expert</h1>
            <p>Discover wines through intelligent label recognition</p>
          </div>

          <nav className="app-navigation">
            <button
              className={`nav-button ${currentState === 'upload' ? 'active' : ''}`}
              onClick={handleNewScan}
            >
              📷 New Scan
            </button>
            <button
              className={`nav-button ${currentState === 'history' ? 'active' : ''}`}
              onClick={handleViewHistory}
            >
              📚 History
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentState === 'upload' && (
          <div className="upload-section">
            <WineLabelUpload
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
            />
            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <button className="btn-retry" onClick={() => setError(null)}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {currentState === 'results' && selectedWine && searchResult && (
          <div className="results-section">
            <div className="results-actions">
              <button className="btn-back" onClick={handleNewScan}>
                ← Scan Another Wine
              </button>
              <button className="btn-history" onClick={handleViewHistory}>
                📚 View History
              </button>
            </div>

            <WineInfo
              wine={selectedWine}
              confidence={searchResult.confidence}
              uploadedImageUrl={uploadedImageUrl}
              onAddToFavorites={handleAddToFavorites}
              onShare={handleShare}
            />

            <TastingNotes
              wine={selectedWine}
              userNotes={userNotes[selectedWine.id] || ''}
              onSaveUserNotes={(notes) => handleSaveUserNotes(selectedWine.id, notes)}
            />

            {searchResult.extractedText && (
              <div className="extracted-text-section">
                <h3>Extracted Text from Label</h3>
                <div className="extracted-text">
                  <p>{searchResult.extractedText}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentState === 'history' && (
          <div className="history-section">
            <div className="history-actions">
              <button className="btn-back" onClick={handleNewScan}>
                ← New Scan
              </button>
            </div>

            <UserHistory onWineSelect={handleWineSelect} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2024 Wine Expert. Powered by AI-driven wine recognition technology.</p>
          <div className="footer-links">
            <span>Made with ❤️ for wine enthusiasts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;