function Card(id, ill) {
    this.id = id;
    this.illPathName = ill;
    this.flipped = false;
    this.matched = false;
    this.flippedCount = 0;
  }
  
  export const shuffleCards = cards => {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  
    return cards;
  };
  
  export const setUpCards = pairsN => {
    const illustrations = [];
    const randomIdsSet = new Set();
  
    while (illustrations.length < pairsN) {
      const randomId = Math.floor(Math.random() * 32) + 1;
      if (!randomIdsSet.has(randomId)) {
        randomIdsSet.add(randomId);
        illustrations.push(`ill-${randomId}.svg`);
      }
    }
  
    const cards = [...illustrations, ...illustrations].map((ill, index) => {
      return new Card(index, ill);
    });
  
    return shuffleCards(cards);
  };
  
  export const calculateGameDuration = (startDate, endDate = null) => {
    if (!startDate) {
      return "00:00";
    }
    const start = new Date(startDate).getTime();
    const now = endDate ? new Date(endDate).getTime() : new Date().getTime();
    const duration = now - start;
  
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
  
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  export const calculateAccuracy = (matches, moves) => {
    return moves > 0 ? Math.max(0, Math.round((matches / moves) * 100)) : 0;
  };
  