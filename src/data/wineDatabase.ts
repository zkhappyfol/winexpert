import { Wine } from '../types/Wine.ts';

export const mockWineDatabase: Wine[] = [
  {
    id: '1',
    name: 'Opus One',
    producer: 'Opus One Winery',
    vintage: 2018,
    region: 'Napa Valley',
    country: 'USA',
    grapeVarieties: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot', 'Cabernet Franc'],
    price: 450,
    rating: 96,
    description: 'Exceptional Bordeaux-style blend showcasing Napa Valley terroir with complex flavors and elegant structure.',
    tastingNotes: {
      appearance: 'Deep ruby red with purple highlights',
      aroma: 'Complex aromas of blackcurrant, cedar, vanilla, and tobacco',
      taste: 'Full-bodied with rich flavors of dark fruit, chocolate, and spices',
      finish: 'Long and elegant finish with silky tannins'
    },
    foodPairings: ['Grilled ribeye steak', 'Lamb with rosemary', 'Aged cheeses', 'Dark chocolate'],
    servingTemperature: '60-65°F (16-18°C)',
    imageUrl: '/images/opus-one.jpg',
    source: 'database'
  },
  {
    id: '2',
    name: 'Dom Pérignon Vintage',
    producer: 'Moët & Chandon',
    vintage: 2012,
    region: 'Champagne',
    country: 'France',
    grapeVarieties: ['Chardonnay', 'Pinot Noir'],
    price: 220,
    rating: 95,
    description: 'Iconic Champagne representing the pinnacle of elegance with exceptional balance and refinement.',
    tastingNotes: {
      appearance: 'Brilliant golden color with fine, persistent bubbles',
      aroma: 'Elegant bouquet of white flowers, citrus, and brioche',
      taste: 'Creamy texture with flavors of apple, pear, and mineral notes',
      finish: 'Long, refined finish with subtle toasted notes'
    },
    foodPairings: ['Oysters', 'Caviar', 'White fish', 'Soft cheeses'],
    servingTemperature: '45-50°F (7-10°C)',
    imageUrl: '/images/dom-perignon.jpg',
    source: 'database'
  },
  {
    id: '3',
    name: 'Caymus Cabernet Sauvignon',
    producer: 'Caymus Vineyards',
    vintage: 2020,
    region: 'Napa Valley',
    country: 'USA',
    grapeVarieties: ['Cabernet Sauvignon'],
    price: 85,
    rating: 92,
    description: 'Classic Napa Cabernet with excellent balance and accessibility, smooth and supple texture.',
    tastingNotes: {
      appearance: 'Deep, dark red with garnet highlights',
      aroma: 'Rich aromas of blackberry, cassis, and vanilla oak',
      taste: 'Smooth and supple with ripe fruit flavors and well-integrated tannins',
      finish: 'Medium to long finish with hints of mocha and spice'
    },
    foodPairings: ['Grilled steaks', 'BBQ ribs', 'Mushroom dishes', 'Hard cheeses'],
    servingTemperature: '60-65°F (16-18°C)',
    imageUrl: '/images/caymus.jpg',
    source: 'database'
  },
  {
    id: '4',
    name: 'Cloudy Bay Sauvignon Blanc',
    producer: 'Cloudy Bay',
    vintage: 2022,
    region: 'Marlborough',
    country: 'New Zealand',
    grapeVarieties: ['Sauvignon Blanc'],
    price: 25,
    rating: 90,
    description: 'Quintessential Marlborough Sauvignon Blanc with excellent purity and vibrant tropical character.',
    tastingNotes: {
      appearance: 'Pale straw color with green tints',
      aroma: 'Vibrant aromas of passion fruit, gooseberry, and fresh herbs',
      taste: 'Crisp and refreshing with tropical fruit flavors and citrus acidity',
      finish: 'Clean, zesty finish with mineral undertones'
    },
    foodPairings: ['Seafood', 'Salads', 'Goat cheese', 'Asian cuisine'],
    servingTemperature: '45-50°F (7-10°C)',
    imageUrl: '/images/cloudy-bay.jpg',
    source: 'database'
  },
  {
    id: '5',
    name: 'Barolo Brunate',
    producer: 'Marcarini',
    vintage: 2017,
    region: 'Piedmont',
    country: 'Italy',
    grapeVarieties: ['Nebbiolo'],
    price: 120,
    rating: 94,
    description: 'Traditional Barolo showcasing the elegance of Nebbiolo with complex aromatics and firm structure.',
    tastingNotes: {
      appearance: 'Garnet red with orange highlights',
      aroma: 'Complex aromas of roses, tar, truffle, and red cherry',
      taste: 'Full-bodied with firm tannins, cherry fruit, and earthy undertones',
      finish: 'Very long finish with leather and spice notes'
    },
    foodPairings: ['Truffle dishes', 'Braised beef', 'Wild game', 'Aged Parmesan'],
    servingTemperature: '60-65°F (16-18°C)',
    imageUrl: '/images/barolo-brunate.jpg',
    source: 'database'
  }
];

export const searchWinesByText = (text: string): Wine[] => {
  // 安全检查：确保text不是undefined或null
  if (!text || typeof text !== 'string') {
    console.warn('searchWinesByText called with invalid text:', text);
    return [];
  }

  const searchTerms = text.toLowerCase().split(' ').filter(term => term.length > 2);

  if (searchTerms.length === 0) return [];

  return mockWineDatabase.filter(wine => {
    const searchableText = [
      wine.name,
      wine.producer,
      wine.region,
      wine.country,
      ...wine.grapeVarieties,
      wine.vintage.toString()
    ].join(' ').toLowerCase();

    return searchTerms.some(term =>
      searchableText.includes(term) ||
      searchableText.includes(term.replace(/[^a-z0-9]/g, ''))
    );
  });
};

export const findBestMatch = (text: string): Wine | null => {
  // 安全检查：确保text不是undefined或null
  if (!text || typeof text !== 'string') {
    console.warn('findBestMatch called with invalid text:', text);
    return null;
  }

  const results = searchWinesByText(text);

  if (results.length === 0) return null;

  const scoredResults = results.map(wine => {
    let score = 0;
    const searchableText = [wine.name, wine.producer].join(' ').toLowerCase();
    const textLower = text.toLowerCase();

    if (searchableText.includes(textLower)) score += 10;

    const words = text.toLowerCase().split(' ').filter(w => w.length > 2);
    words.forEach(word => {
      if (searchableText.includes(word)) score += 1;
    });

    return { wine, score };
  });

  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults[0].wine;
};