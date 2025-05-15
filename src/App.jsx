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
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
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

}
