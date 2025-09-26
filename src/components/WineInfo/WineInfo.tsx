import React from 'react';
import { Wine } from '../../types/Wine';
import './WineInfo.css';

interface WineInfoProps {
  wine: Wine;
  confidence: number;
  onAddToFavorites?: (wine: Wine) => void;
  onShare?: (wine: Wine) => void;
}

const WineInfo: React.FC<WineInfoProps> = ({ wine, confidence, onAddToFavorites, onShare }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 95) return '#2e7d32';
    if (rating >= 90) return '#388e3c';
    if (rating >= 85) return '#689f38';
    if (rating >= 80) return '#afb42b';
    return '#f57c00';
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return '#2e7d32';
    if (conf >= 80) return '#689f38';
    if (conf >= 70) return '#afb42b';
    return '#f57c00';
  };

  return (
    <div className="wine-info">
      <div className="wine-header">
        <div className="wine-image">
          <img src={wine.imageUrl} alt={wine.name} />
        </div>
        <div className="wine-title">
          <h1>{wine.name}</h1>
          <h2>{wine.producer}</h2>
          <div className="wine-meta">
            <span className="vintage">{wine.vintage}</span>
            <span className="region">{wine.region}, {wine.country}</span>
          </div>
        </div>
      </div>

      <div className="confidence-bar">
        <div className="confidence-label">
          Match Confidence: <span style={{ color: getConfidenceColor(confidence) }}>
            {confidence.toFixed(0)}%
          </span>
        </div>
        <div className="confidence-progress">
          <div
            className="confidence-fill"
            style={{
              width: `${confidence}%`,
              backgroundColor: getConfidenceColor(confidence)
            }}
          />
        </div>
      </div>

      <div className="wine-details">
        <div className="detail-section">
          <h3>Wine Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Grape Varieties:</span>
              <span className="value">{wine.grapeVarieties.join(', ')}</span>
            </div>
            <div className="detail-item">
              <span className="label">Alcohol:</span>
              <span className="value">{wine.alcoholContent}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Price:</span>
              <span className="value">{formatPrice(wine.price)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Rating:</span>
              <span
                className="value rating"
                style={{ color: getRatingColor(wine.rating) }}
              >
                {wine.rating}/100
              </span>
            </div>
          </div>
        </div>

        <div className="serving-section">
          <h3>Serving Recommendations</h3>
          <div className="serving-grid">
            <div className="serving-item">
              <span className="label">Temperature:</span>
              <span className="value">{wine.servingTemperature}</span>
            </div>
            {wine.decantingTime && (
              <div className="serving-item">
                <span className="label">Decanting:</span>
                <span className="value">{wine.decantingTime}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pairings-section">
          <h3>Food Pairings</h3>
          <div className="pairings-list">
            {wine.foodPairings.map((pairing, index) => (
              <span key={index} className="pairing-tag">
                {pairing}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="wine-actions">
        {onAddToFavorites && (
          <button
            className="btn-primary"
            onClick={() => onAddToFavorites(wine)}
          >
            ❤️ Add to Favorites
          </button>
        )}
        {onShare && (
          <button
            className="btn-secondary"
            onClick={() => onShare(wine)}
          >
            📤 Share
          </button>
        )}
      </div>
    </div>
  );
};

export default WineInfo;