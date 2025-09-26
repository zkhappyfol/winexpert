import { Wine, WineSearchResult } from '../types/Wine';
import { findBestMatch } from '../data/wineDatabase';
import { ImageProcessor } from './ImageProcessor';

export class WineRecognitionService {
  static async analyzeWineLabel(file: File): Promise<WineSearchResult> {
    try {
      const extractedText = await ImageProcessor.extractTextFromImage(file);

      const wine = findBestMatch(extractedText);

      const confidence = wine ? this.calculateConfidence(extractedText, wine) : 0;

      return {
        wine,
        confidence,
        extractedText
      };
    } catch (error) {
      console.error('Wine recognition failed:', error);
      throw new Error('Failed to analyze wine label');
    }
  }

  private static calculateConfidence(extractedText: string, wine: Wine): number {
    const textLower = extractedText.toLowerCase();
    let matches = 0;
    let totalChecks = 0;

    const checks = [
      wine.name.toLowerCase(),
      wine.producer.toLowerCase(),
      wine.region.toLowerCase(),
      wine.vintage.toString(),
      ...wine.grapeVarieties.map(g => g.toLowerCase())
    ];

    checks.forEach(check => {
      totalChecks++;
      if (textLower.includes(check)) {
        matches++;
      }
    });

    const baseConfidence = (matches / totalChecks) * 100;

    return Math.min(95, Math.max(60, baseConfidence));
  }

  static async searchWineByName(name: string): Promise<Wine[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = findBestMatch(name);
        resolve(results ? [results] : []);
      }, 500);
    });
  }
}