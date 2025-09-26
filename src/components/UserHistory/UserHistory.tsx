import React, { useState, useEffect } from 'react';
import UserDataService, { UserWineHistory, UserFavorite } from '../../services/UserDataService';
import { Wine } from '../../types/Wine';
import './UserHistory.css';

interface UserHistoryProps {
  onWineSelect?: (wine: Wine) => void;
}

const UserHistory: React.FC<UserHistoryProps> = ({ onWineSelect }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [history, setHistory] = useState<UserWineHistory[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHistory(UserDataService.getHistory());
    setFavorites(UserDataService.getFavorites());
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const removeFromHistory = (entryId: string) => {
    UserDataService.removeFromHistory(entryId);
    loadData();
  };

  const removeFromFavorites = (wineId: string) => {
    UserDataService.removeFromFavorites(wineId);
    loadData();
  };

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      UserDataService.clearHistory();
      loadData();
    }
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      UserDataService.clearFavorites();
      loadData();
    }
  };

  const exportData = () => {
    const data = UserDataService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wine-expert-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="user-history">
      <div className="history-header">
        <h2>Your Wine Journey</h2>
        <div className="header-actions">
          <button className="btn-export" onClick={exportData}>
            📤 Export Data
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-nav-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 History ({history.length})
        </button>
        <button
          className={`tab-nav-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ Favorites ({favorites.length})
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="history-content">
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <h3>No wines scanned yet</h3>
              <p>Start by uploading a wine label to build your tasting history</p>
            </div>
          ) : (
            <>
              <div className="content-header">
                <h3>Scanned Wines</h3>
                <button className="btn-clear" onClick={clearAllHistory}>
                  🗑️ Clear All
                </button>
              </div>

              <div className="wine-list">
                {history.map((entry) => (
                  <div key={entry.id} className="wine-item">
                    <div className="wine-summary" onClick={() => toggleExpanded(entry.id)}>
                      <div className="wine-basic-info">
                        <h4>{entry.wine.name}</h4>
                        <p>{entry.wine.producer} • {entry.wine.vintage}</p>
                        <div className="item-meta">
                          <span className="confidence">
                            {entry.confidence.toFixed(0)}% match
                          </span>
                          <span className="date">{formatDate(entry.scannedAt)}</span>
                        </div>
                      </div>
                      <div className="wine-actions">
                        <span className="expand-icon">
                          {expandedItem === entry.id ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {expandedItem === entry.id && (
                      <div className="wine-details">
                        <div className="detail-row">
                          <span className="detail-label">Region:</span>
                          <span>{entry.wine.region}, {entry.wine.country}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Price:</span>
                          <span>{formatPrice(entry.wine.price)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Rating:</span>
                          <span>{entry.wine.rating}/100</span>
                        </div>
                        {entry.userNotes && (
                          <div className="user-notes">
                            <strong>Your Notes:</strong>
                            <p>{entry.userNotes}</p>
                          </div>
                        )}
                        <div className="item-actions">
                          <button
                            className="btn-primary-small"
                            onClick={() => onWineSelect?.(entry.wine)}
                          >
                            View Details
                          </button>
                          <button
                            className="btn-danger-small"
                            onClick={() => removeFromHistory(entry.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="favorites-content">
          {favorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <h3>No favorite wines yet</h3>
              <p>Add wines to your favorites to keep track of the ones you love</p>
            </div>
          ) : (
            <>
              <div className="content-header">
                <h3>Favorite Wines</h3>
                <button className="btn-clear" onClick={clearAllFavorites}>
                  🗑️ Clear All
                </button>
              </div>

              <div className="wine-list">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="wine-item">
                    <div className="wine-summary" onClick={() => toggleExpanded(favorite.id)}>
                      <div className="wine-basic-info">
                        <h4>{favorite.wine.name}</h4>
                        <p>{favorite.wine.producer} • {favorite.wine.vintage}</p>
                        <div className="item-meta">
                          <span className="rating">
                            {favorite.wine.rating}/100
                          </span>
                          <span className="date">Added {formatDate(favorite.addedAt)}</span>
                        </div>
                      </div>
                      <div className="wine-actions">
                        <span className="expand-icon">
                          {expandedItem === favorite.id ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {expandedItem === favorite.id && (
                      <div className="wine-details">
                        <div className="detail-row">
                          <span className="detail-label">Region:</span>
                          <span>{favorite.wine.region}, {favorite.wine.country}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Price:</span>
                          <span>{formatPrice(favorite.wine.price)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Grapes:</span>
                          <span>{favorite.wine.grapeVarieties.join(', ')}</span>
                        </div>
                        {favorite.userNotes && (
                          <div className="user-notes">
                            <strong>Your Notes:</strong>
                            <p>{favorite.userNotes}</p>
                          </div>
                        )}
                        <div className="item-actions">
                          <button
                            className="btn-primary-small"
                            onClick={() => onWineSelect?.(favorite.wine)}
                          >
                            View Details
                          </button>
                          <button
                            className="btn-danger-small"
                            onClick={() => removeFromFavorites(favorite.wine.id)}
                          >
                            Remove from Favorites
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHistory;