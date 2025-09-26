import React, { useState } from 'react';
import { Wine } from '../../types/Wine';
import './TastingNotes.css';

interface TastingNotesProps {
  wine: Wine;
  userNotes?: string;
  onSaveUserNotes?: (notes: string) => void;
}

const TastingNotes: React.FC<TastingNotesProps> = ({
  wine,
  userNotes = '',
  onSaveUserNotes
}) => {
  const [activeTab, setActiveTab] = useState<'professional' | 'user'>('professional');
  const [editingUserNotes, setEditingUserNotes] = useState(false);
  const [currentUserNotes, setCurrentUserNotes] = useState(userNotes);

  const handleSaveUserNotes = () => {
    onSaveUserNotes?.(currentUserNotes);
    setEditingUserNotes(false);
  };

  const tastingCategories = [
    {
      key: 'appearance' as keyof typeof wine.tastingNotes,
      label: 'Appearance',
      icon: '👁️'
    },
    {
      key: 'nose' as keyof typeof wine.tastingNotes,
      label: 'Aroma/Nose',
      icon: '👃'
    },
    {
      key: 'palate' as keyof typeof wine.tastingNotes,
      label: 'Palate/Taste',
      icon: '👅'
    },
    {
      key: 'finish' as keyof typeof wine.tastingNotes,
      label: 'Finish',
      icon: '⏱️'
    }
  ];

  return (
    <div className="tasting-notes">
      <div className="tasting-header">
        <h2>Tasting Notes</h2>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'professional' ? 'active' : ''}`}
            onClick={() => setActiveTab('professional')}
          >
            🍷 Professional
          </button>
          <button
            className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            📝 My Notes
          </button>
        </div>
      </div>

      {activeTab === 'professional' ? (
        <div className="professional-notes">
          <div className="overall-impression">
            <h3>Overall Impression</h3>
            <p>{wine.tastingNotes.overall}</p>
          </div>

          <div className="detailed-notes">
            {tastingCategories.map(({ key, label, icon }) => (
              <div key={key} className="note-category">
                <div className="category-header">
                  <span className="category-icon">{icon}</span>
                  <h4>{label}</h4>
                </div>
                <p>{wine.tastingNotes[key]}</p>
              </div>
            ))}
          </div>

          <div className="expert-recommendation">
            <h3>Expert Recommendation</h3>
            <div className="recommendation-content">
              <div className="rating-display">
                <span className="rating-number">{wine.rating}</span>
                <span className="rating-scale">/100</span>
              </div>
              <div className="rating-description">
                {wine.rating >= 95 && "Exceptional - A wine of extraordinary quality"}
                {wine.rating >= 90 && wine.rating < 95 && "Outstanding - A wine of superior character"}
                {wine.rating >= 85 && wine.rating < 90 && "Very Good - A wine with special qualities"}
                {wine.rating >= 80 && wine.rating < 85 && "Good - A solid, well-made wine"}
                {wine.rating < 80 && "Average - An acceptable wine"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="user-notes">
          {!editingUserNotes ? (
            <div className="notes-display">
              {currentUserNotes ? (
                <>
                  <p>{currentUserNotes}</p>
                  <button
                    className="btn-secondary"
                    onClick={() => setEditingUserNotes(true)}
                  >
                    ✏️ Edit Notes
                  </button>
                </>
              ) : (
                <div className="no-notes">
                  <p>You haven't added any personal tasting notes yet.</p>
                  <button
                    className="btn-primary"
                    onClick={() => setEditingUserNotes(true)}
                  >
                    📝 Add Your Tasting Notes
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="notes-editor">
              <h3>Your Tasting Notes</h3>
              <textarea
                value={currentUserNotes}
                onChange={(e) => setCurrentUserNotes(e.target.value)}
                placeholder="Share your thoughts about this wine... What did you notice about its appearance, aroma, taste, and finish? How did you enjoy it?"
                rows={8}
                className="notes-textarea"
              />
              <div className="editor-actions">
                <button
                  className="btn-primary"
                  onClick={handleSaveUserNotes}
                >
                  💾 Save Notes
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingUserNotes(false);
                    setCurrentUserNotes(userNotes);
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

          <div className="tasting-tips">
            <h4>Tasting Tips</h4>
            <ul>
              <li><strong>Look:</strong> Observe the color and clarity</li>
              <li><strong>Swirl:</strong> Release the aromas in the glass</li>
              <li><strong>Smell:</strong> Take note of different scent layers</li>
              <li><strong>Taste:</strong> Let the wine coat your palate</li>
              <li><strong>Finish:</strong> Notice how long the flavors linger</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TastingNotes;