import { AIVisionService, WineLabelAnalysis } from './AIVisionService.ts';

export class ImageProcessor {
  private static isInitialized = false;

  static async initializeAI(): Promise<void> {
    if (!this.isInitialized) {
      // Configure AI Vision Service
      // For development, you can use the test mode
      // For production, configure with your preferred AI service

      // Example configurations (uncomment and configure as needed):

      // OpenAI GPT-4V configuration:
      // AIVisionService.configure({
      //   provider: 'openai',
      //   apiKey: 'your-openai-api-key',
      //   model: 'gpt-4-vision-preview'
      // });

      // Google Vision configuration:
      // AIVisionService.configure({
      //   provider: 'google',
      //   apiKey: 'your-google-api-key'
      // });

      // Claude Vision configuration:
      // AIVisionService.configure({
      //   provider: 'claude',
      //   apiKey: 'your-claude-api-key',
      //   endpoint: 'https://api.anthropic.com/v1/messages'
      // });

      // For now, we'll use development mode without API calls
      console.log('AI Vision Service initialized in development mode');
      this.isInitialized = true;
    }
  }

  static async extractTextFromImage(file: File): Promise<string> {
    await this.initializeAI();

    try {
      // Use AI Vision Service instead of OCR
      const analysis = await this.analyzeWineLabelWithAI(file);
      return analysis.extractedText;
    } catch (error) {
      console.error('AI Vision analysis failed:', error);
      throw new Error('Failed to analyze wine label with AI vision');
    }
  }

  static async analyzeWineLabelWithAI(file: File): Promise<WineLabelAnalysis> {
    await this.initializeAI();

    try {
      // Use AI Vision Service to analyze the wine label
      return await AIVisionService.analyzeWineLabel(file);
    } catch (error) {
      console.error('AI wine label analysis failed:', error);
      throw new Error('Failed to analyze wine label');
    }
  }

  static async preprocessImage(file: File): Promise<File> {
    // AI vision models typically handle preprocessing internally
    // This method can be used for client-side image optimization if needed
    return file;
  }

  static async terminate(): Promise<void> {
    // Clean up resources if needed
    this.isInitialized = false;
    console.log('AI Vision Service terminated');
  }

  // Utility method to validate image file
  static validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeInMB = 10; // 10MB limit

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      throw new Error(`File too large. Please upload an image smaller than ${maxSizeInMB}MB.`);
    }

    return true;
  }
}