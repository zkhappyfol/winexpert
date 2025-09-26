export interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  region: string;
  country: string;
  grapeVarieties: string[];
  alcoholContent: number;
  price: number;
  rating: number;
  tastingNotes: {
    appearance: string;
    nose: string;
    palate: string;
    finish: string;
    overall: string;
  };
  foodPairings: string[];
  servingTemperature: string;
  decantingTime?: string;
  imageUrl: string;
}

export interface WineSearchResult {
  wine: Wine | null;
  confidence: number;
  extractedText: string;
}