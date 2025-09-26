import React, { useState, useRef, ChangeEvent } from 'react';
import './WineLabelUpload.css';

interface WineLabelUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

const WineLabelUpload: React.FC<WineLabelUploadProps> = ({ onImageUpload, isProcessing }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageUpload(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="wine-label-upload">
      <div className="upload-header">
        <h2>Upload Wine Label</h2>
        <p>Take a photo or upload an image of your wine label</p>
      </div>

      {!previewUrl ? (
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <h3>Drop your wine label here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              <small>Supports: JPG, PNG, HEIC (Max 10MB)</small>
            </div>
          </div>
        </div>
      ) : (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={previewUrl} alt="Wine label preview" />
            {isProcessing && (
              <div className="processing-overlay">
                <div className="spinner"></div>
                <p>Analyzing wine label...</p>
              </div>
            )}
          </div>
          <div className="preview-actions">
            <button onClick={clearImage} className="btn-secondary" disabled={isProcessing}>
              Upload Different Image
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default WineLabelUpload;