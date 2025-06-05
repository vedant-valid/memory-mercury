import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from './Game'; // The new extracted component
import * as utils from '../utils'; // To access the mock

// Mock dependencies for Game.jsx
vi.mock('../utils', async (importOriginal) => {
  const originalUtils = await importOriginal();
  return {
    ...originalUtils,
    setUpCards: vi.fn(),
    // Mock other utils if they are complex or have side effects not relevant to Game logic
    // For now, keep calculateGameDuration and calculateAccuracy as actual implementations
    // unless tests show they cause issues or need control.
  };
});

vi.mock('../layouts', () => ({ // Mock Layout (default export)
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

// Mock child display components
vi.mock('./GameStats', () => ({ // Default export
    default: ({ stats }) => <div data-testid="game-stats">{JSON.stringify(stats)}</div>
}));
vi.mock('./GameBoard', () => ({ // Default export
    default: ({ cards, handleCardClick, grid }) => (
    <div data-testid="game-board" className={grid}>
      {cards.map(card => (
        <button
          key={card.id}
          data-testid={`card-${card.id}`}
          onClick={() => handleCardClick(card)}
          data-flipped={card.flipped}
          data-matched={card.matched}
        >
          {card.illusPathName}
        </button>
      ))}
    </div>
  )
}));
vi.mock('./GameFooter', () => ({ // Default export
    default: ({ handleLevelChange, handleGameRestart }) => (
    <div data-testid="game-footer">
      <button onClick={handleLevelChange}>Select Level</button>
      <button onClick={handleGameRestart}>Restart Game</button>
    </div>
  )
}));
vi.mock('./Level', () => ({ // Default export
    default: ({ handleLevelClick }) => (
    <div data-testid="levels">
      {/* Provide some mock levels to click */}
      <button onClick={() => handleLevelClick({ name: 'Easy', pair: 4, grid: 'grid-cols-4' })}>Easy</button>
      <button onClick={() => handleLevelClick({ name: 'Medium', pair: 6, grid: 'grid-cols-4' })}>Medium</button>
    </div>
  )
}));
vi.mock('./Win', () => ({ // Default export
    default: ({ handleGameRestart, handleLevelChange, stats }) => (
    <div data-testid="win-screen">
      <h2>You Won!</h2>
      <div>{JSON.stringify(stats)}</div>
      <button onClick={handleLevelChange}>Change Level</button>
      <button onClick={handleGameRestart}>Play Again</button>
    </div>
  )
}));

// Mock window.confirm
global.window.confirm = vi.fn();

describe('Game Component Tests', () => {
  // Updated mockLevelEasy to have 4 pairs, to match the mocked Levels component
  const mockLevelEasy = { name: 'Easy', pair: 4, grid: 'grid-cols-4' }; // 4 pairs = 8 cards
  const mockCardsEasy = [ // Updated to 4 pairs
    { id: 1, illPathName: 'ill-1.svg', flipped: false, matched: false, flippedCount: 0 },
    { id: 2, illPathName: 'ill-2.svg', flipped: false, matched: false, flippedCount: 0 },
    { id: 3, illPathName: 'ill-3.svg', flipped: false, matched: false, flippedCount: 0 },
    { id: 4, illPathName: 'ill-4.svg', flipped: false, matched: false, flippedCount: 0 },
    { id: 5, illPathName: 'ill-1.svg', flipped: false, matched: false, flippedCount: 0 }, // Match for card 1
    { id: 6, illPathName: 'ill-2.svg', flipped: false, matched: false, flippedCount: 0 }, // Match for card 2
    { id: 7, illPathName: 'ill-3.svg', flipped: false, matched: false, flippedCount: 0 }, // Match for card 3
    { id: 8, illPathName: 'ill-4.svg', flipped: false, matched: false, flippedCount: 0 }, // Match for card 4
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    utils.setUpCards.mockImplementation((pairs) => {
      if (pairs === mockLevelEasy.pair) { // Now mockLevelEasy.pair is 4
        return JSON.parse(JSON.stringify(mockCardsEasy)); // Returns 8 cards
      }
      // Fallback for other pair counts (though current tests only use 'Easy')
      const genericCards = [];
      for (let i = 0; i < pairs * 2; i++) {
        genericCards.push({ id: i + 1, illPathName: `ill-${(i % pairs) + 1}.svg`, flipped: false, matched: false, flippedCount: 0 });
      }
      return genericCards;
    });
    window.confirm.mockReturnValue(true); // Default to 'OK'
  });

  it('should render Levels component initially', () => {
    render(<Game />);
    expect(screen.getByTestId('levels')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument(); // From mocked Levels
  });

  it('should initialize game when a level is selected', async () => {
    render(<Game />);
    fireEvent.click(screen.getByText('Easy')); // From mocked Levels component

    await waitFor(() => {
      expect(utils.setUpCards).toHaveBeenCalledWith(mockLevelEasy.pair);
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(screen.getByTestId('game-stats')).toBeInTheDocument();
      // Check if cards from mockCardsEasy are rendered by mocked GameBoard
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-4')).toBeInTheDocument();
    });
  });

  it('should flip a card on click', async () => {
    render(<Game />);
    fireEvent.click(screen.getByText('Easy')); // Start game
    await waitFor(() => expect(screen.getByTestId('card-1')).toBeInTheDocument());

    const card1Button = screen.getByTestId('card-1');
    expect(card1Button.getAttribute('data-flipped')).toBe('false');
    fireEvent.click(card1Button);

    // It seems the component updates data-flipped attribute synchronously based on setCards
    // If not, an await waitFor might be needed here.
    // Let's check current behavior. If this fails, wrap in waitFor.
    expect(card1Button.getAttribute('data-flipped')).toBe('true');
  });

  it('should match two identical cards and update stats', async () => {
    render(<Game />);
    fireEvent.click(screen.getByText('Easy'));
    await waitFor(() => expect(screen.getByTestId('card-1')).toBeInTheDocument());

    // With updated mockCardsEasy (8 cards):
    // card1 (id:1) is 'ill-1.svg'
    // card5 (id:5) is 'ill-1.svg' (match for card1)
    const card1 = screen.getByTestId('card-1');
    const card5 = screen.getByTestId('card-5');

    fireEvent.click(card1);
    fireEvent.click(card5);

    await waitFor(() => {
      // Cards should be marked as matched
      expect(card1.getAttribute('data-matched')).toBe('true');
      expect(card5.getAttribute('data-matched')).toBe('true'); // Corrected card3 to card5
      // Stats should update: moves: 1, matchedCards: 1
      const stats = JSON.parse(screen.getByTestId('game-stats').textContent);
      expect(stats.moves).toBe(1);
      expect(stats.matchedCards).toBe(1);
    });
  });

  it('should not match two different cards, update stats, and flip them back', async () => {
    render(<Game />);
    fireEvent.click(screen.getByText('Easy'));
    await waitFor(() => expect(screen.getByTestId('card-1')).toBeInTheDocument());

    // card1 (id:1) is 'ill-1.svg'
    // card2 (id:2) is 'ill-2.svg' (no match)
    const card1 = screen.getByTestId('card-1');
    const card2 = screen.getByTestId('card-2');

    fireEvent.click(card1);
    // await waitFor(() => expect(card1.getAttribute('data-flipped')).toBe('true')); // Should be synchronous
    expect(card1.getAttribute('data-flipped')).toBe('true');
    fireEvent.click(card2);
    // await waitFor(() => expect(card2.getAttribute('data-flipped')).toBe('true')); // Should be synchronous
    expect(card2.getAttribute('data-flipped')).toBe('true');

    // Stats update first
    await waitFor(() => {
      const stats = JSON.parse(screen.getByTestId('game-stats').textContent);
      expect(stats.moves).toBe(1);
      expect(stats.misses).toBe(1);
    });

    // Then cards flip back (after 1s timeout in Game.jsx)
    await waitFor(() => {
      expect(card1.getAttribute('data-flipped')).toBe('false');
      expect(card2.getAttribute('data-flipped')).toBe('false');
    }, { timeout: 1500 }); // Wait a bit longer for the timeout
  });

  it('should display Win component when all cards are matched', async () => {
    // setUpCards is already configured for mockLevelEasy (4 pairs)
    render(<Game />); // Removed duplicate render
    fireEvent.click(screen.getByText('Easy'));
    await waitFor(() => expect(screen.getByTestId('card-1')).toBeInTheDocument());

    // Match all 4 pairs based on the updated mockCardsEasy
    // Pair 1: card-1 (ill-1) & card-5 (ill-1)
    fireEvent.click(screen.getByTestId('card-1')); fireEvent.click(screen.getByTestId('card-5'));
    await waitFor(() => expect(screen.getByTestId('card-1').getAttribute('data-matched')).toBe('true'));

    // Pair 2: card-2 (ill-2) & card-6 (ill-2)
    fireEvent.click(screen.getByTestId('card-2')); fireEvent.click(screen.getByTestId('card-6'));
    await waitFor(() => expect(screen.getByTestId('card-2').getAttribute('data-matched')).toBe('true'));

    // Pair 3: card-3 (ill-3) & card-7 (ill-3)
    fireEvent.click(screen.getByTestId('card-3')); fireEvent.click(screen.getByTestId('card-7'));
    await waitFor(() => expect(screen.getByTestId('card-3').getAttribute('data-matched')).toBe('true'));

    // Pair 4: card-4 (ill-4) & card-8 (ill-4)
    fireEvent.click(screen.getByTestId('card-4')); fireEvent.click(screen.getByTestId('card-8'));

    await waitFor(() => {
        // When the win condition is met, the game board might disappear immediately.
        // So, primarily check for the win screen.
        expect(screen.getByTestId('win-screen')).toBeInTheDocument();
        expect(screen.getByText('You Won!')).toBeInTheDocument();
        // Check stats on win screen if needed, e.g.
        const statsOnWinScreen = JSON.parse(screen.getByTestId('win-screen').querySelector('div').textContent);
        expect(statsOnWinScreen.moves).toBe(4); // 4 pairs = 4 moves if all are matches
        expect(statsOnWinScreen.matchedCards).toBe(4);
    }, {timeout: 2000 });
  });

  it('should restart game when Play Again is clicked on Win screen', async () => {
    render(<Game />);
    fireEvent.click(screen.getByText('Easy'));
    await waitFor(() => expect(screen.getByTestId('card-1')).toBeInTheDocument());

    // Win the game (using 4 pairs)
    fireEvent.click(screen.getByTestId('card-1')); fireEvent.click(screen.getByTestId('card-5'));
    await waitFor(() => expect(screen.getByTestId('card-5').getAttribute('data-matched')).toBe('true'));
    fireEvent.click(screen.getByTestId('card-2')); fireEvent.click(screen.getByTestId('card-6'));
    await waitFor(() => expect(screen.getByTestId('card-6').getAttribute('data-matched')).toBe('true'));
    fireEvent.click(screen.getByTestId('card-3')); fireEvent.click(screen.getByTestId('card-7'));
    await waitFor(() => expect(screen.getByTestId('card-7').getAttribute('data-matched')).toBe('true'));
    fireEvent.click(screen.getByTestId('card-4')); fireEvent.click(screen.getByTestId('card-8'));
    await waitFor(() => expect(screen.getByTestId('win-screen')).toBeInTheDocument(), {timeout: 2000});

    utils.setUpCards.mockClear();
    // Provide a distinctly new set of cards for the restarted game to check against
    const restartedCards = [
        { id: 101, illPathName: 'new-1.svg', flipped: false, matched: false, flippedCount: 0 },
        { id: 102, illPathName: 'new-2.svg', flipped: false, matched: false, flippedCount: 0 },
        // ... add all 8 cards for 4 pairs
        { id: 103, illPathName: 'new-3.svg', flipped: false, matched: false, flippedCount: 0 },
        { id: 104, illPathName: 'new-4.svg', flipped: false, matched: false, flippedCount: 0 },
        { id: 105, illPathName: 'new-1.svg', flipped: false, matched: false, flippedCount: 0 },
        { id: 106, illPathName: 'new-2.svg', flipped: false, matched: false, flippedCount: 0 },
        { id: 107, illPathName: 'new-3.svg', flipped: false, matched: false, flippedCount: 0 },
        { id: 108, illPathName: 'new-4.svg', flipped: false, matched: false, flippedCount: 0 },
    ];
    utils.setUpCards.mockReturnValue(JSON.parse(JSON.stringify(restartedCards)));

    fireEvent.click(screen.getByText('Play Again'));

    await waitFor(() => {
      expect(utils.setUpCards).toHaveBeenCalledWith(mockLevelEasy.pair);
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(screen.getByTestId('card-101')).toBeInTheDocument(); // Check for new card
      const stats = JSON.parse(screen.getByTestId('game-stats').textContent);
      expect(stats.moves).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.matchedCards).toBe(0);
    });
  });

  it('should go to Levels screen when Change Level is clicked on Win screen', async () => {
    render(<Game />);
    fireEvent.click(screen.getByText('Easy'));
    await waitFor(() => expect(screen.getByTestId('card-1')).toBeInTheDocument());

    // Win the game (using 4 pairs)
    fireEvent.click(screen.getByTestId('card-1')); fireEvent.click(screen.getByTestId('card-5'));
    await waitFor(() => expect(screen.getByTestId('card-5').getAttribute('data-matched')).toBe('true'));
    fireEvent.click(screen.getByTestId('card-2')); fireEvent.click(screen.getByTestId('card-6'));
    await waitFor(() => expect(screen.getByTestId('card-6').getAttribute('data-matched')).toBe('true'));
    fireEvent.click(screen.getByTestId('card-3')); fireEvent.click(screen.getByTestId('card-7'));
    await waitFor(() => expect(screen.getByTestId('card-7').getAttribute('data-matched')).toBe('true'));
    fireEvent.click(screen.getByTestId('card-4')); fireEvent.click(screen.getByTestId('card-8'));
    await waitFor(() => expect(screen.getByTestId('win-screen')).toBeInTheDocument(), {timeout: 2000});

    fireEvent.click(screen.getByText('Change Level'));

    await waitFor(() => {
      expect(screen.getByTestId('levels')).toBeInTheDocument();
    });
  });

});
