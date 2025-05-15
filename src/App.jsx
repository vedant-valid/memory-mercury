import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts";
import GameStats from "./components/GameStats";
import GameBoard from "./components/GameBoard";
import GameFooter from "./components/GameFooter";
import Levels from "./components/Level";
import Win from "./components/Win";
import Leaderboard from "./components/LeaderBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./Login";
import { setUpCards } from "./utils";
import "./App.css";
function game() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [moves, setMoves] = useState(0);
  const [misses, setMisses] = useState(0);
  const [matchedCards, setMatchedCards] = useState(0);
  // const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const initializeGame = () => {
    const initCards = setUpCards(selectedLevel.pair);
    setCards(initCards);

    setStartedAt(new Date().toISOString());
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
      initializeGame();
    }
  };
  // p-1 (Flip cards on click functionallity)
  const handleCardClick = card => {
    if (card.flipped || card.matched) return;

    setCards(prev =>
      prev.map(c => (c.id === card.id ? { ...card, flipped: true, flippedCount: c.flippedCount + 1 } : c)),
    );
    setFlippedCards(prev => [...prev, card]);
  };
    // p-2 ( for not matching the previous card close previously opened cards when the third card is clicked, if they are still open)
    const closeExtraCards = () => {
      // This will clear timeout for closing cards after 1 second to avoid multiple flip
      clearTimeout(timeoutId);
  
      const lastOpenCard = flippedCards[flippedCards.length - 1];
  
      setFlippedCards([lastOpenCard]);
      setCards(cards.map(c => (c.id !== lastOpenCard.id ? { ...c, flipped: c.matched ? c.flipped : false } : c)));
    };
      // p-3 (verify if the opened cards are matching and modify the stats)
  const checkForMatch = () => {
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      //  moves increasses
      setMoves(prev => prev + 1);

      if (card1.illusPathName === card2.illusPathName) {
        setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id ? { ...c, matched: true } : c)));

        // Add matched cards no.
        setMatchedCards(prev => prev + 1);

      //   // Play matching cards sound
      //   setPlaySuccessSound(true);
      // } else {
      //   if (card1.flippedCount > 0 && card2.flippedCount > 0) {
      //     // Increment misses
      //     setMisses(prev => prev + 1);
      //   }

        // Will Flip cards back after 1 second
        const timeId = setTimeout(() => {
          flipBack();
        }, 1000);

        // Save timeout ID for using in closeExtraCards() function
        setTimeoutId(timeId);
      }
    }
  };
   // p-4 (Reverse the cards i.e flip back if the match cards are not found)
   const flipBack = () => {
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;

      setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id ? { ...c, flipped: false } : c)));
      setFlippedCards([]);
    }
  };
  // all after-effects adn side-effects-
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
  }, [flippedCards]);

  // useEffect(() => {
  //   if (cards.length) {
  //     const unmatchedCards = cards.filter(c => !c.matched);
  //     if (!unmatchedCards.length) {
  //       setTimeout(() => {
  //         setEndedAt(new Date().toISOString());
  //         new Audio('/audio/level-win.mp3').play();
  //       }, 1000);
  //     }
  //   }
  // }, [cards]);

  // useEffect(() => {
  //   if (playSuccessSound) {
  //     new Audio('/audio/success-sound.mp3').play();
  //     setPlaySuccessSound(false);
  //   }
  // }, [playSuccessSound]);

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
          <GameBoard cards={cards} handleCardClick={handleCardClick} grid={selectedLevel.grid} />
          <GameFooter handleLevelChange={handleLevelChange} handleGameRestart={handleGameRestart} />
        </div>
      ) : (
        <Levels handleLevelClick={l => setSelectedLevel(l)} />
      )}
    </Layout>
  );
}



