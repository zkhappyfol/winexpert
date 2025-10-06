export interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  region: string;
  country: string;
  grapeVarieties: string[];
  rating: number;
  price?: number; // 价格设为可选
  description: string;
  imageUrl: string;
  tastingNotes: {
    appearance: string;
    aroma: string;
    taste: string;
    finish: string;
  };
  foodPairings: string[];
  servingTemperature: string;
  source?: string; // 'database' | 'ai-recognized'
}

export interface WineSearchResult {
  wine: Wine | null;
  confidence: number;
  extractedText: string;
  aiAnalysis?: any; // Additional AI analysis data
}