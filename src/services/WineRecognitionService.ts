import { Wine, WineSearchResult } from '../types/Wine.ts';
import { findBestMatch } from '../data/wineDatabase.ts';
import { ImageProcessor } from './ImageProcessor.ts';

export class WineRecognitionService {
  static async analyzeWineLabel(file: File): Promise<WineSearchResult> {
    try {
      // Validate image file first
      ImageProcessor.validateImageFile(file);

      // Use AI Vision to analyze the wine label
      const aiAnalysis = await ImageProcessor.analyzeWineLabelWithAI(file);

      // Create wine from AI analysis directly (skip database search for now)
      let wine = await this.createWineFromAIAnalysis(aiAnalysis);

      // Fallback: Try to find match in database only if AI analysis failed
      if (!wine) {
        wine = findBestMatch(aiAnalysis.extractedText || '');
      }

      // Calculate confidence based on AI analysis and database match
      const confidence = wine ? this.calculateAdvancedConfidence(aiAnalysis, wine) : aiAnalysis.confidence;

      return {
        wine,
        confidence,
        extractedText: aiAnalysis.extractedText || 'No text extracted',
        aiAnalysis // Include the full AI analysis for additional information
      };
    } catch (error) {
      console.error('Wine recognition failed:', error);
      throw new Error('Failed to analyze wine label');
    }
  }

  private static async createWineFromAIAnalysis(analysis: any): Promise<Wine | null> {
    // Create a Wine object from AI analysis with more flexible requirements
    if (!analysis || (!analysis.wineName && !analysis.producer && !analysis.extractedText)) {
      return null;
    }

    // Use available information, provide defaults for missing fields
    const wineName = analysis.wineName || 'Unknown Wine';
    const producer = analysis.producer || 'Unknown Producer';

    // Generate AI description in Chinese
    const chineseDescription = await this.generateChineseDescription(analysis);

    // Generate a unique ID based on the wine information
    const id = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      name: wineName,
      producer: producer,
      vintage: parseInt(analysis.vintage) || 2020,
      region: analysis.region || 'Unknown Region',
      country: this.inferCountryFromRegion(analysis.region),
      grapeVarieties: analysis.grapeVarieties || [],
      rating: this.estimateRating(analysis),
      // 移除价格字段
      description: chineseDescription, // 使用AI生成的中文描述
      imageUrl: '', // Will be populated with uploaded image if needed
      tastingNotes: {
        appearance: analysis.additionalInfo?.wineType ? `${analysis.additionalInfo.wineType} wine` : '',
        aroma: '',
        taste: '',
        finish: ''
      },
      foodPairings: this.suggestFoodPairings(analysis.grapeVarieties || []),
      servingTemperature: this.suggestServingTemperature(analysis.additionalInfo?.wineType),
      source: 'ai-recognized' // Mark as AI-recognized
    };
  }

  private static calculateAdvancedConfidence(aiAnalysis: any, wine: Wine): number {
    let confidence = aiAnalysis.confidence;

    // Boost confidence if we found a database match
    if (wine.source !== 'ai-recognized') {
      confidence = Math.min(95, confidence + 15);
    }

    // Adjust confidence based on completeness of analysis
    const completenessFactors = [
      aiAnalysis.wineName,
      aiAnalysis.producer,
      aiAnalysis.vintage,
      aiAnalysis.region,
      aiAnalysis.grapeVarieties?.length > 0,
      aiAnalysis.alcoholContent
    ];

    const completeness = completenessFactors.filter(Boolean).length / completenessFactors.length;
    confidence = Math.floor(confidence * (0.7 + 0.3 * completeness));

    return Math.min(95, Math.max(60, confidence));
  }

  private static inferCountryFromRegion(region: string): string {
    if (!region) return 'Unknown';

    const regionCountryMap: { [key: string]: string } = {
      'napa valley': 'USA',
      'sonoma': 'USA',
      'california': 'USA',
      'oregon': 'USA',
      'washington': 'USA',
      'bordeaux': 'France',
      'burgundy': 'France',
      'champagne': 'France',
      'loire valley': 'France',
      'rhône': 'France',
      'tuscany': 'Italy',
      'piedmont': 'Italy',
      'veneto': 'Italy',
      'rioja': 'Spain',
      'ribera del duero': 'Spain',
      'barossa valley': 'Australia',
      'margaret river': 'Australia',
      'marlborough': 'New Zealand',
      'central otago': 'New Zealand',
      'mendoza': 'Argentina',
      'maipo valley': 'Chile',
      'stellenbosch': 'South Africa'
    };

    const regionLower = region.toLowerCase();
    for (const [regionName, country] of Object.entries(regionCountryMap)) {
      if (regionLower.includes(regionName)) {
        return country;
      }
    }

    return 'Unknown';
  }

  private static estimateRating(analysis: any): number {
    // Basic rating estimation based on wine characteristics
    let baseRating = 75;

    // Premium indicators
    if (analysis.additionalInfo?.classification?.toLowerCase().includes('reserve')) {
      baseRating += 10;
    }
    if (analysis.additionalInfo?.classification?.toLowerCase().includes('grand')) {
      baseRating += 15;
    }
    if (analysis.producer?.toLowerCase().includes('château')) {
      baseRating += 5;
    }

    // Vintage consideration
    const currentYear = new Date().getFullYear();
    const vintage = parseInt(analysis.vintage);
    if (vintage && vintage >= currentYear - 5) {
      baseRating += 5; // Recent vintage bonus
    }

    return Math.min(95, Math.max(65, baseRating + Math.floor(Math.random() * 10)));
  }

  private static suggestFoodPairings(grapeVarieties: string[]): string[] {
    const pairingMap: { [key: string]: string[] } = {
      'cabernet sauvignon': ['grilled steak', 'lamb', 'aged cheeses', 'dark chocolate'],
      'merlot': ['roasted chicken', 'pork tenderloin', 'mushroom dishes', 'soft cheeses'],
      'pinot noir': ['salmon', 'duck', 'mushroom risotto', 'charcuterie'],
      'chardonnay': ['lobster', 'roasted chicken', 'creamy pasta', 'grilled fish'],
      'sauvignon blanc': ['goat cheese', 'seafood', 'salads', 'herbs and vegetables'],
      'riesling': ['spicy cuisine', 'pork', 'fruit desserts', 'asian dishes']
    };

    const pairings = new Set<string>();

    grapeVarieties.forEach(grape => {
      const grapeLower = grape.toLowerCase();
      if (pairingMap[grapeLower]) {
        pairingMap[grapeLower].forEach(pairing => pairings.add(pairing));
      }
    });

    return Array.from(pairings).slice(0, 4); // Return up to 4 pairings
  }

  private static suggestServingTemperature(wineType?: string): string {
    if (!wineType) return '16-18°C';

    const temperatureMap: { [key: string]: string } = {
      'red': '16-18°C',
      'white': '8-12°C',
      'rosé': '10-12°C',
      'sparkling': '6-8°C',
      'dessert': '10-12°C'
    };

    return temperatureMap[wineType.toLowerCase()] || '16-18°C';
  }

  static async searchWineByName(name: string): Promise<Wine[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = findBestMatch(name);
        resolve(results ? [results] : []);
      }, 500);
    });
  }

  private static async generateChineseDescription(analysis: any): Promise<string> {
    try {
      // 导入AIConfigManager
      const { AIConfigManager } = await import('../config/AIConfig.ts');

      const config = AIConfigManager.getConfig();

      // 构建用于生成描述的prompt
      const wineInfo = {
        名称: analysis.wineName || '未知',
        生产商: analysis.producer || '未知',
        年份: analysis.vintage || '未知',
        产区: analysis.region || '未知',
        葡萄品种: (analysis.grapeVarieties || []).join('、') || '未知',
        酒精度: analysis.alcoholContent || '未知',
        类型: analysis.additionalInfo?.wineType || '未知'
      };

      const prompt = `请为以下葡萄酒生成一段专业的中文品鉴描述（约100-150字）：

酒款信息：
- 名称：${wineInfo.名称}
- 生产商：${wineInfo.生产商}
- 年份：${wineInfo.年份}
- 产区：${wineInfo.产区}
- 葡萄品种：${wineInfo.葡萄品种}
- 酒精度：${wineInfo.酒精度}
- 类型：${wineInfo.类型}

请生成一段专业、优雅的中文酒评，包含这款酒的特色、风味特点、品鉴建议等。语言要生动有趣，适合葡萄酒爱好者阅读。直接返回描述文字，不要包含其他格式。`;

      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model || 'qwen-vl-plus',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const description = data.choices?.[0]?.message?.content;

        if (description) {
          // 清理可能的markdown格式
          const cleanDescription = description.replace(/```[^`]*```/g, '').trim();
          console.log('Generated Chinese description:', cleanDescription);
          return cleanDescription;
        }
      }
    } catch (error) {
      console.error('Failed to generate Chinese description:', error);
    }

    // 如果AI生成失败，返回基本的中文描述
    return this.generateFallbackChineseDescription(analysis);
  }

  private static generateFallbackChineseDescription(analysis: any): string {
    const wineName = analysis.wineName || '这款葡萄酒';
    const producer = analysis.producer || '酒庄';
    const region = analysis.region || '产区';
    const grapeVarieties = analysis.grapeVarieties?.length > 0 ? analysis.grapeVarieties.join('、') : '';

    let description = `${wineName}来自${producer}，产自${region}。`;

    if (grapeVarieties) {
      description += `这款酒采用${grapeVarieties}酿制，`;
    }

    description += '展现出该产区的独特风土特色，口感平衡，适合搭配多种美食享用。这是一款值得品鉴的精品葡萄酒。';

    return description;
  }
}