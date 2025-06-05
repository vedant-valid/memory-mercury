import { useEffect, useState } from "react";
import Layout from "../layouts"; // Adjusted path
import GameStats from "./GameStats"; // Adjusted path (assuming it's a sibling)
import GameBoard from "./GameBoard"; // Adjusted path
import GameFooter from "./GameFooter"; // Adjusted path
import Levels from "./Level"; // Adjusted path
import Win from "./Win"; // Adjusted path
import { setUpCards } from "../utils"; // Adjusted path

// The Game component function, copied from App.jsx
export default function Game() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [moves, setMoves] = useState(0);
  const [misses, setMisses] = useState(0);
  const [matchedCards, setMatchedCards] = useState(0);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);

  const initializeGame = () => {
    if (!selectedLevel) return; // Guard against null selectedLevel
    const initCards = setUpCards(selectedLevel.pair);
    setCards(initCards);
    setStartedAt(new Date().toISOString());
    setEndedAt(null); // Ensure endedAt is reset
  };

  const resetStats = () => {
    setMoves(0);
    setMisses(0);
    setMatchedCards(0);
    setStartedAt(null);
    setEndedAt(null);
  };

  const handleLevelChange = () => {
    let confirmed = true;
    if (!endedAt && moves > 0) {
      confirmed = window.confirm(
        "Game in progress, are you sure you want to leave?"
      );
    }
    if (confirmed) {
      resetStats();
      setSelectedLevel(null);
    }
  };

  const handleGameRestart = () => {
    let confirmed = true;
    if (!endedAt && moves > 0) {
      confirmed = window.confirm("Are you sure you want to restart the game?");
    }
    if (confirmed) {
      resetStats();
      initializeGame(); // Re-initialize with current selectedLevel
    }
  };

  const handleCardClick = card => {
    if (flippedCards.length >= 2 || card.flipped || card.matched) return;

    setCards(prev =>
      prev.map(c => (c.id === card.id ? { ...c, flipped: true, flippedCount: c.flippedCount + 1 } : c)),
    );
    setFlippedCards(prev => [...prev, card]);
  };

  const closeExtraCards = () => {
    clearTimeout(timeoutId);
    const lastOpenCard = flippedCards[flippedCards.length - 1];
    setFlippedCards([lastOpenCard]);
    setCards(cards.map(c => (c.id !== lastOpenCard.id ? { ...c, flipped: c.matched ? c.flipped : false } : c)));
  };

  const flipBack = () => {
    if (flippedCards.length === 2) { // Ensure we only flip back if 2 cards are there
      const [card1, card2] = flippedCards;
      setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id ? { ...c, flipped: false } : c)));
    }
    setFlippedCards([]); // Always clear flipped cards
  };

  const checkForMatch = () => {
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      setMoves(prev => prev + 1);

      if (card1.illPathName === card2.illPathName) { // Corrected illusPathName to illPathName
        setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id ? { ...c, matched: true } : c)));
        setMatchedCards(prev => prev + 1);
        // Check for win condition
        if (matchedCards + 1 === cards.length / 2) {
            setEndedAt(new Date().toISOString());
        }
        setFlippedCards([]); // Matched cards are kept flipped (by matched: true), clear flippedCards array
      } else {
        setMisses(prev => prev + 1);
        const timeId = setTimeout(() => {
          flipBack();
        }, 1000);
        setTimeoutId(timeId);
      }
    }
  };

  useEffect(() => {
    if (selectedLevel) {
      initializeGame();
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (flippedCards.length > 2) {
      closeExtraCards();
    } else if (flippedCards.length === 2) {
      checkForMatch();
    }
  }, [flippedCards]); // Removed 'cards' from dependency array

  // Check for win condition when matchedCards or total cards change
   useEffect(() => {
    if (cards.length > 0 && matchedCards === cards.length / 2) {
        if (!endedAt) { // only set endedAt if not already set
            setEndedAt(new Date().toISOString());
        }
    }
  }, [matchedCards, cards, endedAt]);


  return (
    <Layout>
      {endedAt ? (
        <Win
          handleGameRestart={handleGameRestart}
          handleLevelChange={handleLevelChange}
          stats={{ selectedLevel, moves, misses, matchedCards, startedAt, endedAt }}
        />
      ) : startedAt ? (
        <div className="game-grid">
          <GameStats stats={{ selectedLevel, moves, misses, matchedCards, startedAt, endedAt }} />
          <GameBoard cards={cards} handleCardClick={handleCardClick} grid={selectedLevel ? selectedLevel.grid : ''} />
          <GameFooter handleLevelChange={handleLevelChange} handleGameRestart={handleGameRestart} />
        </div>
      ) : (
        <Levels handleLevelClick={l => setSelectedLevel(l)} />
      )}
    </Layout>
  );
}
