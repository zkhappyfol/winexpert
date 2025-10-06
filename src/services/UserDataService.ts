import { Wine } from '../types/Wine.ts';

export interface UserWineHistory {
  id: string;
  wine: Wine;
  scannedAt: Date;
  confidence: number;
  userNotes?: string;
}

export interface UserFavorite {
  id: string;
  wine: Wine;
  addedAt: Date;
  userNotes?: string;
}

class UserDataService {
  private static readonly HISTORY_KEY = 'wine-expert-history';
  private static readonly FAVORITES_KEY = 'wine-expert-favorites';

  static getHistory(): UserWineHistory[] {
    const stored = localStorage.getItem(this.HISTORY_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        scannedAt: new Date(item.scannedAt)
      }));
    } catch (error) {
      console.error('Failed to parse history:', error);
      return [];
    }
  }

  static addToHistory(wine: Wine, confidence: number, userNotes?: string): void {
    const history = this.getHistory();
    const newEntry: UserWineHistory = {
      id: `${wine.id}-${Date.now()}`,
      wine,
      scannedAt: new Date(),
      confidence,
      userNotes
    };

    const updatedHistory = [newEntry, ...history.slice(0, 49)];
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
  }

  static updateHistoryNotes(entryId: string, notes: string): void {
    const history = this.getHistory();
    const entryIndex = history.findIndex(entry => entry.id === entryId);

    if (entryIndex !== -1) {
      history[entryIndex].userNotes = notes;
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    }
  }

  static removeFromHistory(entryId: string): void {
    const history = this.getHistory();
    const filtered = history.filter(entry => entry.id !== entryId);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
  }

  static getFavorites(): UserFavorite[] {
    const stored = localStorage.getItem(this.FAVORITES_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }));
    } catch (error) {
      console.error('Failed to parse favorites:', error);
      return [];
    }
  }

  static addToFavorites(wine: Wine, userNotes?: string): boolean {
    const favorites = this.getFavorites();
    const exists = favorites.some(fav => fav.wine.id === wine.id);

    if (exists) return false;

    const newFavorite: UserFavorite = {
      id: `fav-${wine.id}-${Date.now()}`,
      wine,
      addedAt: new Date(),
      userNotes
    };

    const updatedFavorites = [newFavorite, ...favorites];
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  }

  static removeFromFavorites(wineId: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.wine.id !== wineId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
  }

  static updateFavoriteNotes(favoriteId: string, notes: string): void {
    const favorites = this.getFavorites();
    const favoriteIndex = favorites.findIndex(fav => fav.id === favoriteId);

    if (favoriteIndex !== -1) {
      favorites[favoriteIndex].userNotes = notes;
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  static isFavorite(wineId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.wine.id === wineId);
  }

  static clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY);
  }

  static clearFavorites(): void {
    localStorage.removeItem(this.FAVORITES_KEY);
  }

  static exportData(): string {
    const history = this.getHistory();
    const favorites = this.getFavorites();

    return JSON.stringify({
      history,
      favorites,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
      }

      if (data.favorites && Array.isArray(data.favorites)) {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data.favorites));
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export default UserDataService;