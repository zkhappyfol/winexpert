# Wine Expert - AI-Powered Wine Label Recognition

A React-based web application that uses AI and OCR technology to identify wines from photos of wine labels and provide detailed information including professional tasting notes, food pairings, and serving recommendations.

## Features

### 🍷 Core Functionality
- **Wine Label Recognition**: Upload photos of wine labels for instant identification
- **OCR Processing**: Extract text from wine labels using Tesseract.js
- **Wine Database**: Comprehensive database with detailed wine information
- **Match Confidence**: AI-powered confidence scoring for recognition accuracy

### 📝 Tasting Experience
- **Professional Tasting Notes**: Detailed appearance, aroma, palate, and finish descriptions
- **Personal Notes**: Add and save your own tasting experiences
- **Expert Ratings**: Professional wine scores and quality assessments
- **Food Pairings**: Curated food and meal recommendations

### 🔖 User Features
- **History Tracking**: Automatic saving of all scanned wines
- **Favorites System**: Save and organize your favorite wines
- **Data Export**: Export your wine history and favorites
- **Responsive Design**: Optimized for desktop and mobile devices

### 🎨 User Interface
- **Intuitive Upload**: Drag-and-drop or click-to-upload interface
- **Image Preview**: Real-time preview with processing indicators
- **Detailed Wine Cards**: Rich wine information display
- **Tab Navigation**: Organized sections for easy browsing

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **OCR Engine**: Tesseract.js for text extraction
- **Image Processing**: HTML5 Canvas for image optimization
- **Storage**: LocalStorage for user data persistence
- **Styling**: Custom CSS with responsive design

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wine-expert-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## How to Use

### 1. Upload Wine Label
- Click the upload area or drag and drop a wine label photo
- Supported formats: JPG, PNG, HEIC (max 10MB)
- Wait for the AI processing to complete

### 2. View Wine Information
- Review the identified wine details and confidence score
- Explore professional tasting notes and ratings
- Check food pairing suggestions and serving recommendations

### 3. Add Personal Notes
- Switch to the "My Notes" tab in the tasting section
- Add your personal tasting experience and thoughts
- Notes are automatically saved to your history

### 4. Manage Your Collection
- Access your scan history in the "History" tab
- Add wines to favorites for quick reference
- Export your data for backup or sharing

## Application Architecture

### Components Structure
```
src/
├── components/
│   ├── WineLabelUpload/     # File upload and image preview
│   ├── WineInfo/            # Wine details display
│   ├── TastingNotes/        # Professional and user notes
│   └── UserHistory/         # History and favorites management
├── services/
│   ├── ImageProcessor.ts    # OCR and image processing
│   ├── WineRecognitionService.ts # Wine identification logic
│   └── UserDataService.ts   # Local storage management
├── data/
│   └── wineDatabase.ts      # Mock wine database
└── types/
    └── Wine.ts              # TypeScript interfaces
```

### Key Services

#### Image Processing
- Image optimization and normalization
- OCR text extraction using Tesseract.js
- Confidence scoring based on text matching

#### Wine Recognition
- Text analysis and wine database matching
- Fuzzy matching for producer names and wine details
- Confidence calculation based on matching criteria

#### User Data Management
- LocalStorage-based persistence
- History and favorites tracking
- Data export/import functionality

## Wine Database

The application includes a curated database of premium wines with:

- **Basic Information**: Producer, vintage, region, grape varieties
- **Professional Ratings**: Scores from wine critics
- **Tasting Notes**: Detailed sensory descriptions
- **Food Pairings**: Recommended cuisine and dishes
- **Serving Guidelines**: Temperature and decanting advice

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support with some iOS limitations
- Mobile browsers: Responsive design optimized

## Performance Considerations

- **OCR Processing**: Runs client-side, may take 3-10 seconds
- **Image Optimization**: Automatic resizing for optimal processing
- **Caching**: Efficient component re-rendering with React hooks
- **Storage**: LocalStorage used for offline data persistence

## Future Enhancements

- [ ] Integration with real wine APIs (Vivino, Wine.com)
- [ ] Barcode scanning for additional wine identification
- [ ] Social sharing and wine recommendations
- [ ] Multi-language OCR support
- [ ] Advanced wine collection analytics
- [ ] Cloud storage and synchronization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tesseract.js team for the excellent OCR library
- Wine data sourced from various wine education resources
- React community for the robust development framework