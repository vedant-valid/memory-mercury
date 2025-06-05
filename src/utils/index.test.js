import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setUpCards, shuffleCards, calculateGameDuration, calculateAccuracy } from './index.js'; // Assuming index.js is the entry point for utils

describe('setUpCards', () => {
  it('should return correct number of cards and pairs', () => {
    const numberOfPairs = 8;
    const cards = setUpCards(numberOfPairs);
    expect(cards.length).toBe(numberOfPairs * 2);

    const uniqueIllustrations = new Set(cards.map(card => card.illPathName)); // Changed illusPathName to illPathName
    expect(uniqueIllustrations.size).toBe(numberOfPairs);

    uniqueIllustrations.forEach(illPathName => { // Changed illusPathName to illPathName
      const count = cards.filter(card => card.illPathName === illPathName).length; // Changed illusPathName to illPathName
      expect(count).toBe(2);
    });
  });

  it('should initialize cards correctly', () => {
    const numberOfPairs = 4;
    const cards = setUpCards(numberOfPairs);
    cards.forEach(card => {
      expect(card.flipped).toBe(false);
      expect(card.matched).toBe(false);
      expect(card.flippedCount).toBe(0);
      expect(card.id).toBeDefined();
      expect(card.illPathName).toBeDefined(); // Changed illusPathName to illPathName
    });
  });
});

describe('shuffleCards', () => {
  it('should shuffle the cards', () => {
    const orderedCards = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `card-${i}` }));
    const orderedCardsString = JSON.stringify(orderedCards);

    const shuffledCards = shuffleCards([...orderedCards]);

    expect(shuffledCards.length).toBe(orderedCards.length);
    orderedCards.forEach(card => {
      expect(shuffledCards).toContainEqual(card);
    });

    // It's theoretically possible for shuffle to result in the same order,
    // but highly improbable for a reasonable number of cards.
    // For a small number of cards, this might occasionally fail.
    if (orderedCards.length > 4) { // Arbitrary threshold to reduce flakiness for very small arrays
        const shuffledCardsString = JSON.stringify(shuffledCards);
        expect(shuffledCardsString).not.toBe(orderedCardsString);
    }
  });

  it('should return an empty array when shuffling an empty array', () => {
    expect(shuffleCards([])).toEqual([]);
  });
});

describe('calculateGameDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate duration correctly for seconds when endDate is not provided', () => {
    const startTime = new Date(2023, 0, 1, 10, 0, 0);
    vi.setSystemTime(startTime);
    const gameStartTimeISO = startTime.toISOString();

    const futureTime = new Date(2023, 0, 1, 10, 0, 30);
    vi.setSystemTime(futureTime);

    expect(calculateGameDuration(gameStartTimeISO)).toBe("00:30");
  });

  it('should calculate duration correctly for minutes and seconds when endDate is not provided', () => {
    const startTime = new Date(2023, 0, 1, 10, 0, 0);
    vi.setSystemTime(startTime);
    const gameStartTimeISO = startTime.toISOString();

    const futureTime = new Date(2023, 0, 1, 10, 2, 15);
    vi.setSystemTime(futureTime);

    expect(calculateGameDuration(gameStartTimeISO)).toBe("02:15");
  });

  it('should calculate duration correctly when endDate is provided', () => {
    const startDate = new Date(2023, 0, 1, 10, 0, 0).toISOString();
    const endDate = new Date(2023, 0, 1, 10, 5, 30).toISOString();
    expect(calculateGameDuration(startDate, endDate)).toBe("05:30");
  });

  it('should return "00:00" for zero duration', () => {
    const date = new Date(2023, 0, 1, 10, 0, 0).toISOString();
    vi.setSystemTime(new Date(date)); // Ensure "now" is the same as date for the first call
    expect(calculateGameDuration(date, date)).toBe("00:00");
  });

  it('should return "00:00" if startDate is not provided', () => {
    expect(calculateGameDuration(null)).toBe("00:00");
  });
});

describe('calculateAccuracy', () => {
  it('should return 0 if moves are 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('should calculate accuracy correctly', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
  });

  it('should return 0 if matches are 0 (and moves > 0)', () => {
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it('should return 100 if matches equal moves (and moves > 0)', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('should handle cases resulting in non-integer accuracy by rounding', () => {
    expect(calculateAccuracy(1, 3)).toBe(33); // 1/3 = 33.33... -> 33
    expect(calculateAccuracy(2, 3)).toBe(67); // 2/3 = 66.66... -> 67
  });
});
