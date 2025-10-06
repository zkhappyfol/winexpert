// AI Vision Service for Wine Label Recognition
// Supports multiple vision AI providers (OpenAI GPT-4V, Google Vision, Claude Vision, etc.)

import { AIConfigManager, AIServiceConfig } from '../config/AIConfig.ts';

export interface WineLabelAnalysis {
  wineName: string;
  producer: string;
  vintage: string;
  region: string;
  grapeVarieties: string[];
  alcoholContent?: string;
  confidence: number;
  extractedText: string;
  additionalInfo?: {
    wineType?: string;
    appellation?: string;
    classification?: string;
  };
}

export class AIVisionService {
  private static initialized = false;

  static initialize(): void {
    if (!this.initialized) {
      AIConfigManager.loadFromEnvironment();

      const config = AIConfigManager.getConfig();
      console.log(`AI Vision Service initialized with provider: ${config.provider}`);

      if (!AIConfigManager.validateConfig()) {
        console.warn('AI Vision Service configuration is incomplete');
        if (config.provider !== 'development') {
          console.log('Instructions for configuration:');
          console.log(AIConfigManager.getProviderInstructions()[config.provider]);
        }
      }

      this.initialized = true;
    }
  }

  static async analyzeWineLabel(imageFile: File): Promise<WineLabelAnalysis> {
    this.initialize();

    const config = AIConfigManager.getConfig();

    // Debug: Log current configuration
    console.log('Current AI Config:', {
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      model: config.model,
      endpoint: config.endpoint
    });

    if (config.provider === 'development') {
      console.log('Using development mode - returning mock data');
      return this.developmentAnalysis(imageFile);
    }

    console.log(`Using ${config.provider} provider for real AI analysis`);

    try {
      const base64Image = await this.fileToBase64(imageFile);

      switch (config.provider) {
        case 'openai':
          return await this.analyzeWithOpenAI(base64Image, config);
        case 'google':
          return await this.analyzeWithGoogle(base64Image, config);
        case 'gemini':
          return await this.analyzeWithGemini(base64Image, config);
        case 'anyrouter':
          return await this.analyzeWithAnyRouter(base64Image, config);
        case 'claude':
          return await this.analyzeWithClaude(base64Image, config);
        case 'custom':
          return await this.analyzeWithCustomAPI(base64Image, config);
        default:
          throw new Error(`Unsupported AI provider: ${config.provider}`);
      }
    } catch (error) {
      console.error('AI Vision analysis failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        provider: config.provider
      });

      // Fallback to development mode if enabled
      if (config.enableFallback) {
        console.log('Falling back to development mode due to error');
        return this.developmentAnalysis(imageFile);
      }

      throw new Error('Failed to analyze wine label with AI vision');
    }
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/xxx;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private static async analyzeWithOpenAI(base64Image: string, config: AIServiceConfig): Promise<WineLabelAnalysis> {
    const prompt = `
    Analyze this wine label image and extract the following information in JSON format:
    {
      "wineName": "exact wine name",
      "producer": "producer/winery name",
      "vintage": "year as string",
      "region": "region/appellation",
      "grapeVarieties": ["grape1", "grape2"],
      "alcoholContent": "alcohol percentage if visible",
      "wineType": "red/white/rosé/sparkling/dessert",
      "appellation": "specific appellation/AVA if mentioned",
      "classification": "classification level if mentioned",
      "extractedText": "all visible text on the label"
    }

    Be precise and only include information that is clearly visible on the label.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return {
      ...analysis,
      confidence: this.calculateConfidence(analysis),
      additionalInfo: {
        wineType: analysis.wineType,
        appellation: analysis.appellation,
        classification: analysis.classification
      }
    };
  }

  private static async analyzeWithGoogle(base64Image: string, config: AIServiceConfig): Promise<WineLabelAnalysis> {
    // Google Vision API implementation
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: 'TEXT_DETECTION', maxResults: 50 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.responses[0].textAnnotations?.[0]?.description || '';

    // Use pattern matching to parse the extracted text into structured wine information
    return await this.parseWineInfoFromText(extractedText);
  }

  private static async analyzeWithGemini(base64Image: string, config: AIServiceConfig): Promise<WineLabelAnalysis> {
    // Google Gemini API implementation
    const model = config.model || 'gemini-pro-vision';
    const prompt = `
    Analyze this wine label image and extract the following information in JSON format:
    {
      "wineName": "exact wine name",
      "producer": "producer/winery name",
      "vintage": "year as string",
      "region": "region/appellation",
      "grapeVarieties": ["grape1", "grape2"],
      "alcoholContent": "alcohol percentage if visible",
      "wineType": "red/white/rosé/sparkling/dessert",
      "appellation": "specific appellation/AVA if mentioned",
      "classification": "classification level if mentioned",
      "extractedText": "all visible text on the label"
    }

    Be precise and only include information that is clearly visible on the label.
    Return only valid JSON without any additional text.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }

    const textContent = data.candidates[0].content.parts[0].text;

    try {
      const analysis = JSON.parse(textContent);
      return {
        ...analysis,
        confidence: this.calculateConfidence(analysis),
        additionalInfo: {
          wineType: analysis.wineType,
          appellation: analysis.appellation,
          classification: analysis.classification
        }
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', textContent);
      // Fallback to text parsing
      return await this.parseWineInfoFromText(textContent);
    }
  }

  private static async analyzeWithAnyRouter(base64Image: string, config: AIServiceConfig): Promise<WineLabelAnalysis> {
    // AnyRouter API implementation (unified AI API proxy) - now using Qwen Vision
    const model = config.model || 'qwen-vl-plus';
    const endpoint = config.endpoint || '/api/chat/completions';

    console.log('AnyRouter API call:', {
      model,
      endpoint,
      hasApiKey: !!config.apiKey,
      apiKeyPrefix: config.apiKey?.substring(0, 10) + '...'
    });

    const prompt = `
    Analyze this wine label image and extract the following information in JSON format:
    {
      "wineName": "exact wine name",
      "producer": "producer/winery name",
      "vintage": "year as string",
      "region": "region/appellation",
      "grapeVarieties": ["grape1", "grape2"],
      "alcoholContent": "alcohol percentage if visible",
      "wineType": "red/white/rosé/sparkling/dessert",
      "appellation": "specific appellation/AVA if mentioned",
      "classification": "classification level if mentioned",
      "extractedText": "all visible text on the label"
    }

    Be precise and only include information that is clearly visible on the label.
    Return only valid JSON without any additional text.
    `;

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    };

    console.log('AnyRouter request body (without image):', {
      ...requestBody,
      messages: [
        {
          ...requestBody.messages[0],
          content: [
            requestBody.messages[0].content[0],
            { type: 'image_url', image_url: { url: '[BASE64_IMAGE]', detail: 'high' } }
          ]
        }
      ]
    });

    const response = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('AnyRouter response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AnyRouter API error response:', errorText);
      throw new Error(`AnyRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    //const responseText = await response.text();
    //console.log('AnyRouter raw response:', responseText.substring(0, 200) + '...');

    // AIVisionService.ts (修正后的逻辑)

    // ... fetch请求之后 ...
    const responseText = await response.text();
    console.log('=== RAW QWEN API RESPONSE ===');
    console.log('Response length:', responseText.length);
    console.log('First 500 chars:', responseText.substring(0, 500));
    console.log('==========================');

    // 解析API响应
    let apiResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      throw new Error('Invalid API response format');
    }

    // 从API响应中提取content
    if (!apiResponse.choices || !apiResponse.choices[0] || !apiResponse.choices[0].message) {
      throw new Error('Invalid API response structure');
    }

    const content = apiResponse.choices[0].message.content;
    console.log('=== EXTRACTED CONTENT ===');
    console.log(content);
    console.log('=======================');

    // 从content中提取JSON（去掉markdown格式）
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);

    if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0]; // 如果有```json包围就取第一个分组，否则取整个匹配
        console.log('=== EXTRACTED JSON STRING ===');
        console.log(jsonString);
        console.log('===========================');
        try {
            // 解析酒标分析JSON
            const analysis = JSON.parse(jsonString);
            console.log('=== SUCCESSFULLY PARSED WINE ANALYSIS ===');
            console.log(JSON.stringify(analysis, null, 2));
            console.log('=======================================');

            return {
              ...analysis,
              confidence: this.calculateConfidence(analysis),
              extractedText: analysis.extractedText || jsonString || 'No text extracted',
              additionalInfo: {
                wineType: analysis.wineType,
                appellation: analysis.appellation,
                classification: analysis.classification
              }
            };
        } catch (e) {
            console.error("提取出的字符串无法被解析为JSON:", jsonString);
            console.error("Parse error:", e);
            // Fallback to text parsing
            return await this.parseWineInfoFromText(content);
        }
    } else {
        console.error("在AI的响应中未找到有效的JSON对象:", content);
        // Fallback to text parsing
        return await this.parseWineInfoFromText(content);
    }
  }

  private static async analyzeWithClaude(base64Image: string, config: AIServiceConfig): Promise<WineLabelAnalysis> {
    // Claude Vision API implementation (Anthropic)
    const prompt = `
    Analyze this wine label image and extract wine information in the following JSON format:
    {
      "wineName": "exact wine name",
      "producer": "producer/winery name",
      "vintage": "year as string",
      "region": "region/appellation",
      "grapeVarieties": ["grape1", "grape2"],
      "alcoholContent": "alcohol percentage if visible",
      "extractedText": "all visible text"
    }
    `;

    const response = await fetch(config.endpoint || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-vision',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.content[0].text);

    return {
      ...analysis,
      confidence: this.calculateConfidence(analysis)
    };
  }

  private static async analyzeWithCustomAPI(base64Image: string, config: AIServiceConfig): Promise<WineLabelAnalysis> {
    // Custom API implementation - can be adapted for any vision service
    const response = await fetch(config.endpoint!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        task: 'wine_label_analysis',
        model: config.model
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
    }

    const analysis = await response.json();
    return {
      ...analysis,
      confidence: this.calculateConfidence(analysis)
    };
  }

  private static async parseWineInfoFromText(text: string): Promise<WineLabelAnalysis> {
    // Enhanced pattern matching for wine info extraction
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let wineName = '';
    let producer = '';
    let vintage = '';
    let region = '';
    let grapeVarieties: string[] = [];
    let alcoholContent = '';

    // Pattern matching (enhanced with more wine-specific patterns)
    for (const line of lines) {
      // Look for vintage (4-digit year)
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch && !vintage) {
        vintage = yearMatch[0];
      }

      // Look for alcohol content
      const alcoholMatch = line.match(/(\d{1,2}\.?\d?)%?\s*(?:alc|alcohol|vol|abv)/i);
      if (alcoholMatch && !alcoholContent) {
        alcoholContent = alcoholMatch[1] + '%';
      }

      // Look for regions
      const regions = ['napa valley', 'sonoma', 'bordeaux', 'burgundy', 'tuscany', 'rioja', 'barossa', 'marlborough'];
      if (!region) {
        for (const r of regions) {
          if (line.toLowerCase().includes(r)) {
            region = line;
            break;
          }
        }
      }

      // Look for common grape varieties
      const grapes = ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc', 'Pinot Grigio', 'Riesling', 'Syrah', 'Shiraz'];
      for (const grape of grapes) {
        if (line.toLowerCase().includes(grape.toLowerCase()) && !grapeVarieties.includes(grape)) {
          grapeVarieties.push(grape);
        }
      }
    }

    // Use heuristics to identify wine name and producer
    if (lines.length > 0) {
      wineName = lines[0]; // Often the first prominent text
      if (lines.length > 1) {
        producer = lines[1]; // Often the second line
      }
    }

    return {
      wineName,
      producer,
      vintage,
      region,
      grapeVarieties,
      alcoholContent,
      extractedText: text,
      confidence: this.calculateConfidence({
        wineName,
        producer,
        vintage,
        region,
        grapeVarieties
      })
    };
  }

  private static calculateConfidence(analysis: any): number {
    let score = 0;
    const checks = [
      analysis.wineName,
      analysis.producer,
      analysis.vintage,
      analysis.region,
      analysis.grapeVarieties?.length > 0
    ];

    checks.forEach(check => {
      if (check && (typeof check === 'string' ? check.trim() : check)) {
        score += 20;
      }
    });

    return Math.min(95, Math.max(30, score));
  }

  // Development/test analysis for when no API is configured
  static async developmentAnalysis(imageFile: File): Promise<WineLabelAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic mock data based on file name or random selection
    const mockWines = [
      {
        wineName: 'Château Margaux',
        producer: 'Château Margaux',
        vintage: '2018',
        region: 'Margaux, Bordeaux',
        grapeVarieties: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot'],
        alcoholContent: '13.5%',
        wineType: 'red',
        appellation: 'Margaux AOC',
        classification: 'Premier Grand Cru Classé'
      },
      {
        wineName: 'Opus One',
        producer: 'Opus One Winery',
        vintage: '2019',
        region: 'Napa Valley',
        grapeVarieties: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'],
        alcoholContent: '14.5%',
        wineType: 'red',
        appellation: 'Napa Valley AVA',
        classification: 'Premium'
      },
      {
        wineName: 'Dom Pérignon',
        producer: 'Moët & Chandon',
        vintage: '2012',
        region: 'Champagne',
        grapeVarieties: ['Chardonnay', 'Pinot Noir'],
        alcoholContent: '12.5%',
        wineType: 'sparkling',
        appellation: 'Champagne AOC',
        classification: 'Prestige Cuvée'
      }
    ];

    const randomWine = mockWines[Math.floor(Math.random() * mockWines.length)];

    return {
      ...randomWine,
      confidence: Math.floor(Math.random() * 15) + 80, // 80-95% confidence
      extractedText: `Mock extracted text for ${randomWine.wineName} from ${randomWine.producer}`,
      additionalInfo: {
        wineType: randomWine.wineType,
        appellation: randomWine.appellation,
        classification: randomWine.classification
      }
    };
  }

  // Test method for API validation
  static async testAPI(): Promise<boolean> {
    try {
      const config = AIConfigManager.getConfig();

      if (config.provider === 'development') {
        return true;
      }

      // Create a small test image (1x1 pixel)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx!.fillStyle = 'white';
      ctx!.fillRect(0, 0, 1, 1);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(resolve as any, 'image/jpeg');
      });

      const testFile = new File([blob!], 'test.jpg', { type: 'image/jpeg' });
      await this.analyzeWineLabel(testFile);

      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }
}