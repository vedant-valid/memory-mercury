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
// import { setUpCards } from "./utils"; // Removed
import "./App.css";
import Game from "./components/Game"; // Added import for new Game component

// The Game() function definition has been removed.
// routing thru pages
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Layout>
            <Leaderboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Game />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;




