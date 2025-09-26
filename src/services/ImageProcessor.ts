import { createWorker } from 'tesseract.js';

export class ImageProcessor {
  private static worker: Tesseract.Worker | null = null;

  static async initializeOCR(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .-',
      });
    }
  }

  static async extractTextFromImage(file: File): Promise<string> {
    await this.initializeOCR();

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      // Use the original file directly - Tesseract.js can handle image processing internally
      const { data: { text } } = await this.worker.recognize(file);
      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static async preprocessImage(file: File): Promise<File> {
    // For now, return the original file as Tesseract.js handles preprocessing internally
    // This can be enhanced later with client-side image processing if needed
    return file;
  }

  static async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}