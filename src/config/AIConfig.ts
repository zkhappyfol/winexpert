// AI Vision Service Configuration
// This file contains configuration for AI vision services

export interface AIServiceConfig {
  // Service provider settings
  provider: 'openai' | 'google' | 'gemini' | 'claude' | 'anyrouter' | 'custom' | 'development';

  // API credentials (store securely in environment variables)
  apiKey?: string;
  endpoint?: string;
  model?: string;

  // Processing options
  maxImageSize: number; // in MB
  supportedFormats: string[];
  timeout: number; // in milliseconds

  // Feature flags
  enableBatchProcessing: boolean;
  enableCaching: boolean;
  enableFallback: boolean;
}

// Default configuration
export const defaultAIConfig: AIServiceConfig = {
  provider: 'development',
  maxImageSize: 10, // 10MB
  supportedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  timeout: 30000, // 30 seconds
  enableBatchProcessing: false,
  enableCaching: true,
  enableFallback: true
};

// Production configuration examples
export const productionConfigs = {
  openai: {
    ...defaultAIConfig,
    provider: 'openai' as const,
    model: 'gpt-4-vision-preview',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },

  google: {
    ...defaultAIConfig,
    provider: 'google' as const,
    endpoint: 'https://vision.googleapis.com/v1/images:annotate'
  },

  gemini: {
    ...defaultAIConfig,
    provider: 'gemini' as const,
    model: 'gemini-pro-vision',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },

  anyrouter: {
    ...defaultAIConfig,
    provider: 'anyrouter' as const,
    model: 'claude-sonnet-4-5-20250929',
    endpoint: 'https://anyrouter.top'
  },

  claude: {
    ...defaultAIConfig,
    provider: 'claude' as const,
    model: 'claude-3-vision',
    endpoint: 'https://api.anthropic.com/v1/messages'
  }
};

// Configuration management
export class AIConfigManager {
  private static currentConfig: AIServiceConfig = defaultAIConfig;

  static getConfig(): AIServiceConfig {
    return { ...this.currentConfig };
  }

  static setConfig(config: Partial<AIServiceConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
  }

  static loadFromEnvironment(): void {
    // Load configuration from environment variables
    const envConfig: Partial<AIServiceConfig> = {};

    console.log('Loading environment variables:', {
      REACT_APP_AI_PROVIDER: process.env.REACT_APP_AI_PROVIDER,
      REACT_APP_AI_API_KEY: process.env.REACT_APP_AI_API_KEY ? 'SET' : 'NOT SET',
      REACT_APP_AI_ENDPOINT: process.env.REACT_APP_AI_ENDPOINT,
      REACT_APP_AI_MODEL: process.env.REACT_APP_AI_MODEL
    });

    if (process.env.REACT_APP_AI_PROVIDER) {
      envConfig.provider = process.env.REACT_APP_AI_PROVIDER as any;
    }

    if (process.env.REACT_APP_AI_API_KEY) {
      envConfig.apiKey = process.env.REACT_APP_AI_API_KEY;
    }

    if (process.env.REACT_APP_AI_ENDPOINT) {
      envConfig.endpoint = process.env.REACT_APP_AI_ENDPOINT;
    }

    if (process.env.REACT_APP_AI_MODEL) {
      envConfig.model = process.env.REACT_APP_AI_MODEL;
    }

    console.log('Environment config loaded:', envConfig);
    this.setConfig(envConfig);
    console.log('Final config after merge:', this.getConfig());
  }

  static validateConfig(): boolean {
    const config = this.getConfig();

    // Development mode doesn't need API keys
    if (config.provider === 'development') {
      return true;
    }

    // Production providers need API keys
    if (!config.apiKey) {
      console.warn('AI Service: API key not configured for production provider');
      return false;
    }

    if (config.provider === 'custom' && !config.endpoint) {
      console.warn('AI Service: Custom endpoint not configured');
      return false;
    }

    return true;
  }

  static getProviderInstructions(): { [key: string]: string } {
    return {
      openai: `
        To configure OpenAI GPT-4V:
        1. Get an API key from https://platform.openai.com/api-keys
        2. Set environment variable: REACT_APP_AI_PROVIDER=openai
        3. Set environment variable: REACT_APP_AI_API_KEY=your_openai_api_key
        4. Optionally set: REACT_APP_AI_MODEL=gpt-4-vision-preview
      `,
      google: `
        To configure Google Vision API:
        1. Create a project in Google Cloud Console
        2. Enable Vision API
        3. Create an API key
        4. Set environment variable: REACT_APP_AI_PROVIDER=google
        5. Set environment variable: REACT_APP_AI_API_KEY=your_google_api_key
      `,
      gemini: `
        To configure Google Gemini:
        1. Visit https://makersuite.google.com/app/apikey
        2. Create a new API key
        3. Set environment variable: REACT_APP_AI_PROVIDER=gemini
        4. Set environment variable: REACT_APP_AI_API_KEY=your_gemini_api_key
        5. Optionally set: REACT_APP_AI_MODEL=gemini-pro-vision
      `,
      anyrouter: `
        To configure AnyRouter:
        1. Visit https://anyrouter.ai and create an account
        2. Get your API key from the dashboard
        3. Set environment variable: REACT_APP_AI_PROVIDER=anyrouter
        4. Set environment variable: REACT_APP_AI_API_KEY=your_anyrouter_api_key
        5. Optionally set: REACT_APP_AI_MODEL=claude-3-5-sonnet-20241022
        6. AnyRouter supports multiple models: gpt-4-vision-preview, claude-3-5-sonnet-20241022, gemini-pro-vision
      `,
      claude: `
        To configure Claude Vision:
        1. Get an API key from https://console.anthropic.com/
        2. Set environment variable: REACT_APP_AI_PROVIDER=claude
        3. Set environment variable: REACT_APP_AI_API_KEY=your_claude_api_key
        4. Optionally set: REACT_APP_AI_MODEL=claude-3-vision
      `,
      custom: `
        To configure a custom AI service:
        1. Set environment variable: REACT_APP_AI_PROVIDER=custom
        2. Set environment variable: REACT_APP_AI_API_KEY=your_api_key
        3. Set environment variable: REACT_APP_AI_ENDPOINT=your_api_endpoint
        4. Optionally set: REACT_APP_AI_MODEL=your_model_name

        Your API should accept POST requests with:
        {
          "image": "base64_image_data",
          "task": "wine_label_analysis",
          "model": "model_name"
        }
      `
    };
  }
}

// Initialize configuration on module load
AIConfigManager.loadFromEnvironment();