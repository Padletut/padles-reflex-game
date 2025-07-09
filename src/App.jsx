import { useState, useEffect } from "react";
import "./App.css";

const GRID_SIZE = 3; // 3x3 grid
const MAX_REACTION_TIME = 1500; // game ends if reaction time exceeds this (in ms)
const MAX_ACTIVE_CELLS = 3; // Maximum number of active cells at once

function getRandomCell(excludeCells = []) {
  const availableCells = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    if (!excludeCells.includes(i)) {
      availableCells.push(i);
    }
  }
  return availableCells.length > 0
    ? availableCells[Math.floor(Math.random() * availableCells.length)]
    : null;
}

function App() {
  const [activeCells, setActiveCells] = useState([]);
  const [cellStartTimes, setCellStartTimes] = useState({});
  const [reactionTimes, setReactionTimes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [lastReactionTime, setLastReactionTime] = useState(null);
  const [score, setScore] = useState(0);
  const [timeoutId, setTimeoutId] = useState(null);
  const [checkTimeoutId, setCheckTimeoutId] = useState(null);
  const [lowestReactionTime, setLowestReactionTime] = useState(null);
  const [highestReactionTime, setHighestReactionTime] = useState(null);
  const [highScore, setHighScore] = useState(() => {
    // Load high score from localStorage
    const saved = localStorage.getItem("reflexGameHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const [gameHistory, setGameHistory] = useState(() => {
    // Load game history from localStorage
    const saved = localStorage.getItem("reflexGameHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute state from localStorage
    const saved = localStorage.getItem("reflexGameMuted");
    return saved ? JSON.parse(saved) : false;
  });

  // Audio pool for better performance and reliability
  const [audioPool] = useState(() => ({
    hit: Array.from({ length: 5 }, () => {
      const audio = new Audio(`${import.meta.env.BASE_URL}hit_effect.wav`);
      audio.volume = 0.5;
      audio.preload = "auto";
      return audio;
    }),
    fail: Array.from({ length: 3 }, () => {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}fail_buzz_effect.wav`
      );
      audio.volume = 0.4;
      audio.preload = "auto";
      return audio;
    }),
    win: (() => {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}win_chime_effect.wav`
      );
      audio.volume = 0.6;
      audio.preload = "auto";
      return audio;
    })(),
    gameOver: (() => {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}73581__benboncan__sad-trombone.wav`
      );
      audio.volume = 0.5;
      audio.preload = "auto";
      return audio;
    })(),
  }));

  // Audio pool indices to cycle through available audio instances
  const [audioIndices, setAudioIndices] = useState({
    hit: 0,
    fail: 0,
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (checkTimeoutId) {
        clearTimeout(checkTimeoutId);
      }
      // Cleanup audio on unmount
      try {
        [
          ...audioPool.hit,
          ...audioPool.fail,
          audioPool.win,
          audioPool.gameOver,
        ].forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      } catch (e) {
        // Silently handle cleanup errors
      }
    };
  }, [timeoutId, checkTimeoutId]);

  // Handle continuous spawning when game is active
  useEffect(() => {
    if (gameStarted && !gameEnded) {
      showNextCell();
      checkForTimeouts();
    }
  }, [gameStarted, gameEnded, activeCells]); // Trigger when activeCells changes

  const startGame = () => {
    setReactionTimes([]);
    setClickCount(0);
    setScore(0);
    setGameStarted(true);
    setGameEnded(false);
    setLastReactionTime(null);
    setLowestReactionTime(null);
    setHighestReactionTime(null);
    setActiveCells([]);
    setCellStartTimes({});
    // Clear any existing timeouts
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (checkTimeoutId) {
      clearTimeout(checkTimeoutId);
    }
  };

  const showNextCell = () => {
    if (!gameStarted || activeCells.length >= MAX_ACTIVE_CELLS) return;

    // Balanced difficulty system - challenging but fair
    const clickScore = clickCount * 75; // Moderate click value progression
    const timeScore = score;
    const totalProgress = clickScore + timeScore;

    // Balanced progression phases - longer initial phases, smoother transitions
    const easyPhase = Math.min(totalProgress / 400, 1); // 0-1 over first 400 points
    const mediumPhase = Math.max(0, Math.min((totalProgress - 400) / 600, 1)); // 0-1 from 400-1000 points
    const hardPhase = Math.max(0, Math.min((totalProgress - 1000) / 1000, 1)); // 0-1 from 1000-2000 points
    const extremePhase = Math.max(
      0,
      Math.min((totalProgress - 2000) / 1500, 1)
    ); // 0-1 from 2000-3500 points
    const insanePhase = Math.max(
      0,
      Math.min((totalProgress - 3500) / 44500, 1)
    ); // 0-1 from 3500-48000 points
    const brutalPhase = Math.max(
      0,
      Math.min((totalProgress - 48000) / 82000, 1)
    ); // 0-1 from 48000-130000 points
    const impossiblePhase = Math.max(0, (totalProgress - 130000) / 100000); // Unlimited scaling beyond 130000

    // More moderate delay reductions - challenging but not overwhelming
    let baseDelay = 1200; // Start the same
    baseDelay *= 1 - easyPhase * 0.35; // 35% reduction in easy phase
    baseDelay *= 1 - mediumPhase * 0.45; // Additional 45% reduction in medium
    baseDelay *= 1 - hardPhase * 0.35; // Additional 35% reduction in hard
    baseDelay *= 1 - extremePhase * 0.25; // Additional 25% reduction in extreme
    baseDelay *= 1 - Math.min(insanePhase, 1) * 0.15; // Additional 15% reduction in insane
    baseDelay *= 1 - Math.min(brutalPhase, 1) * 0.2; // Additional 20% reduction in brutal phase (48k+)
    baseDelay *= 1 - Math.min(impossiblePhase, 2) * 0.25; // Additional 25% reduction in impossible phase (130k+), scales up to 2x

    // Variable delay decreases more moderately
    let variableDelay = 1800;
    variableDelay *= 1 - easyPhase * 0.3; // 30% reduction
    variableDelay *= 1 - mediumPhase * 0.4; // 40% reduction
    variableDelay *= 1 - hardPhase * 0.35; // 35% reduction
    variableDelay *= 1 - extremePhase * 0.25; // 25% reduction
    variableDelay *= 1 - Math.min(insanePhase, 1) * 0.2; // 20% reduction
    variableDelay *= 1 - Math.min(brutalPhase, 1) * 0.25; // Additional 25% reduction in brutal
    variableDelay *= 1 - Math.min(impossiblePhase, 1.5) * 0.3; // Additional 30% reduction in impossible, scales up to 1.5x

    // Moderate randomness increase at higher levels
    const randomnessFactor = Math.min(
      1 + insanePhase * 0.3 + brutalPhase * 0.4 + impossiblePhase * 0.6,
      2.5
    ); // Escalating randomness
    const randomFactor = (0.4 + Math.random() * 0.6) * randomnessFactor; // 0.4 to 1.0, multiplied by randomness factor
    const finalDelay =
      (baseDelay + Math.random() * variableDelay) * randomFactor;

    // More gradual minimum delay reduction with elite level adjustments
    let minDelay = Math.max(120, 350 - totalProgress / 15); // Starts at 350ms, goes down to 120ms more gradually
    if (totalProgress >= 48000) {
      minDelay = Math.max(80, minDelay - (totalProgress - 48000) / 2000); // Further reduction at brutal level
    }
    if (totalProgress >= 130000) {
      minDelay = Math.max(50, minDelay - (totalProgress - 130000) / 5000); // Extreme reduction at impossible level
    }
    const actualDelay = Math.max(minDelay, finalDelay);

    const id = setTimeout(() => {
      if (gameStarted && activeCells.length < MAX_ACTIVE_CELLS) {
        const newCell = getRandomCell(activeCells);
        if (newCell !== null) {
          const now = Date.now();
          setActiveCells((prev) => [...prev, newCell]);
          setCellStartTimes((prev) => ({ ...prev, [newCell]: now }));
        }
      }
    }, actualDelay);

    setTimeoutId(id);
  };

  const checkForTimeouts = () => {
    if (!gameStarted) return;

    const id = setInterval(() => {
      if (!gameStarted) return;

      const now = Date.now();
      for (const cellIndex of activeCells) {
        const startTime = cellStartTimes[cellIndex];
        if (startTime && now - startTime > MAX_REACTION_TIME) {
          // Game over due to timeout
          setLastReactionTime(now - startTime);

          // Clear the interval
          clearInterval(id);

          // End the game with current stats
          endGame(score, now - startTime, clickCount, reactionTimes);
          return;
        }
      }
    }, 100); // Check every 100ms

    setCheckTimeoutId(id);
  };

  // Helper function to save game result and update high score
  const endGame = (
    finalScore,
    finalReactionTime,
    finalClickCount,
    finalReactionTimes
  ) => {
    setGameStarted(false);
    setGameEnded(true);

    // Play game over sound
    playGameOverSound();

    // Clear timeouts
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Update high score if needed
    setHighScore((prevHigh) => {
      const newHigh = Math.max(prevHigh, finalScore);
      if (newHigh > prevHigh && finalScore > 0) {
        // Play win sound for new high score
        playWinSound();
      }
      localStorage.setItem("reflexGameHighScore", newHigh.toString());
      return newHigh;
    });

    // Save game to history
    const gameResult = {
      score: finalScore,
      reactionTime: finalReactionTime,
      clickCount: finalClickCount,
      avgReactionTime:
        finalReactionTimes.length > 0
          ? (
              finalReactionTimes.reduce((a, b) => a + b) /
              finalReactionTimes.length
            ).toFixed(1)
          : finalReactionTime.toFixed(1),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    setGameHistory((prev) => {
      const newHistory = [gameResult, ...prev].slice(0, 15);
      localStorage.setItem("reflexGameHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const playHitSound = () => {
    if (isMuted) return;
    try {
      const audio = audioPool.hit[audioIndices.hit];
      audio.currentTime = 0; // Reset to start
      audio.play().catch(() => {}); // Silently handle errors
      setAudioIndices((prev) => ({
        ...prev,
        hit: (prev.hit + 1) % audioPool.hit.length,
      }));
    } catch (e) {
      // Silently handle audio errors
    }
  };

  const playFailSound = () => {
    if (isMuted) return;
    try {
      const audio = audioPool.fail[audioIndices.fail];
      audio.currentTime = 0; // Reset to start
      audio.play().catch(() => {}); // Silently handle errors
      setAudioIndices((prev) => ({
        ...prev,
        fail: (prev.fail + 1) % audioPool.fail.length,
      }));
    } catch (e) {
      // Silently handle audio errors
    }
  };

  const playWinSound = () => {
    if (isMuted) return;
    try {
      audioPool.win.currentTime = 0;
      audioPool.win.play().catch(() => {});
    } catch (e) {
      // Silently handle audio errors
    }
  };

  const playGameOverSound = () => {
    if (isMuted) return;
    try {
      audioPool.gameOver.currentTime = 0;
      audioPool.gameOver.play().catch(() => {});
    } catch (e) {
      // Silently handle audio errors
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem("reflexGameMuted", JSON.stringify(newMutedState));
  };

  const handleClick = (index, event) => {
    // More reliable event handling
    if (event) {
      event.stopPropagation();
    }

    if (!gameStarted) return;

    // Use a more defensive check for active cells
    const isActiveCell = activeCells.includes(index);
    const hasStartTime = cellStartTimes[index] !== undefined;

    if (!isActiveCell || !hasStartTime) {
      // Play fail sound for clicking on inactive cell
      playFailSound();
      return;
    }

    // Play hit sound effect
    playHitSound();

    const now = Date.now();
    const startTime = cellStartTimes[index];
    const reactionTime = now - startTime;

    // Update all reaction time stats
    setReactionTimes((prev) => [...prev, reactionTime]);
    setClickCount((prev) => prev + 1);
    setLastReactionTime(reactionTime);

    // Update lowest and highest reaction times
    setLowestReactionTime((prev) =>
      prev === null ? reactionTime : Math.min(prev, reactionTime)
    );
    setHighestReactionTime((prev) =>
      prev === null ? reactionTime : Math.max(prev, reactionTime)
    );

    // Calculate score based on reaction time (faster = more points)
    const points = Math.max(0, Math.round(1000 - reactionTime));
    setScore((prev) => prev + points);

    // Remove the clicked cell
    setActiveCells((prev) => prev.filter((cell) => cell !== index));
    setCellStartTimes((prev) => {
      const newTimes = { ...prev };
      delete newTimes[index];
      return newTimes;
    });

    if (reactionTime > MAX_REACTION_TIME) {
      // End the game with updated stats including the current click
      const updatedReactionTimes = [...reactionTimes, reactionTime];
      endGame(
        score + points,
        reactionTime,
        clickCount + 1,
        updatedReactionTimes
      );
    }
  };

  const avgTime = reactionTimes.length
    ? (reactionTimes.reduce((a, b) => a + b) / reactionTimes.length).toFixed(1)
    : 0;

  // Calculate current difficulty level for display - matches balanced progression
  const clickScore = clickCount * 75; // Match the balanced click scoring
  const totalProgress = clickScore + score;

  // Determine difficulty level based on the balanced phase system with elite levels
  let difficultyLevel = 1;
  let difficultyName = "Easy";
  let difficultyColor = "text-green-400";

  if (totalProgress >= 130000) {
    // Impossible phase starts at 130k
    difficultyLevel = Math.min(
      50 + Math.floor((totalProgress - 130000) / 10000),
      999
    ); // 50+ (Impossible), extreme scaling
    difficultyName = "IMPOSSIBLE";
    difficultyColor = "text-purple-500";
  } else if (totalProgress >= 48000) {
    // Brutal phase: 48k-130k
    difficultyLevel = 30 + Math.floor((totalProgress - 48000) / 4000); // 30-49 (Brutal)
    difficultyName = "BRUTAL";
    difficultyColor = "text-pink-500";
  } else if (totalProgress >= 3500) {
    // Insane phase: 3500-48k
    difficultyLevel = Math.min(
      20 + Math.floor((totalProgress - 3500) / 2500),
      29
    ); // 20-29 (Insane)
    difficultyName = "INSANE";
    difficultyColor = "text-red-500";
  } else if (totalProgress >= 2000) {
    // Extreme phase: 2000-3500
    difficultyLevel = 15 + Math.floor((totalProgress - 2000) / 150); // 15-19 (Extreme)
    difficultyName = "Extreme";
    difficultyColor = "text-orange-500";
  } else if (totalProgress >= 1000) {
    // Hard phase: 1000-2000
    difficultyLevel = 10 + Math.floor((totalProgress - 1000) / 100); // 10-14 (Hard)
    difficultyName = "Hard";
    difficultyColor = "text-red-400";
  } else if (totalProgress >= 400) {
    // Medium phase: 400-1000
    difficultyLevel = 5 + Math.floor((totalProgress - 400) / 60); // 5-9 (Medium)
    difficultyName = "Medium";
    difficultyColor = "text-yellow-400";
  } else {
    // Easy phase: 0-400
    difficultyLevel = 1 + Math.floor(totalProgress / 50); // 1-8 (Easy)
    difficultyName = "Easy";
    difficultyColor = "text-green-400";
  }

  return (
    <div className="bg-slate-950 text-white relative p-4">
      {/* Mute Button - Top Right */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 enhanced-mute-button rounded-lg p-3"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <span className="text-xl">{isMuted ? "🔇" : "🔊"}</span>
      </button>

      {/* Left Sidebar - Stats - Force positioned with inline styles */}
      <div
        style={{
          position: "absolute",
          left: "16px",
          top: "185px",
          width: "20rem",
          zIndex: 10,
        }}
        className="space-y-4"
      >
        <div className="enhanced-score-box rounded-lg stats-box">
          <h3 className="text-slate-400 text-sm font-semibold stats-header">
            Performance
          </h3>
          <div className="stats-content">
            <div className="flex justify-between stats-row">
              <span className="text-slate-300 text-sm">Clicks:</span>
              <span className="text-white font-semibold">{clickCount}</span>
            </div>
            <div className="flex justify-between stats-row">
              <span className="text-slate-300 text-sm">Avg Time:</span>
              <span className="text-cyan-400 font-semibold">{avgTime}ms</span>
            </div>
          </div>
        </div>

        <div className="enhanced-score-box rounded-lg stats-box">
          <h3 className="text-slate-400 text-sm font-semibold stats-header">
            Reaction Times
          </h3>
          <div className="stats-content">
            {lowestReactionTime !== null ? (
              <>
                <div className="flex justify-between stats-row">
                  <span className="text-slate-300 text-sm">Best:</span>
                  <span className="text-emerald-400 font-semibold">
                    {lowestReactionTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between stats-row">
                  <span className="text-slate-300 text-sm">Worst:</span>
                  <span className="text-red-400 font-semibold">
                    {highestReactionTime?.toFixed(0)}ms
                  </span>
                </div>
              </>
            ) : (
              <p
                className="text-slate-400 text-xs text-center"
                style={{ padding: "24px 0" }}
              >
                Start playing to see stats
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="h-full flex flex-col items-center pt-16 pb-8">
        {/* Simple Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 enhanced-title">
            Reflex Game
          </h1>
        </div>

        {/* Simple Score Section - Above Grid */}
        <div className="flex gap-6 score-section">
          <div className="enhanced-score-box rounded-lg px-8 py-4 text-center min-w-[120px]">
            <p className="text-slate-400 text-sm mb-1">Score</p>
            <p className="text-2xl font-bold text-yellow-400">{score}</p>
          </div>
          {gameStarted && (
            <div className="enhanced-score-box rounded-lg px-8 py-4 text-center min-w-[140px]">
              <p className="text-slate-400 text-sm mb-1">Level</p>
              <p className={`text-2xl font-bold ${difficultyColor}`}>
                {difficultyLevel}
              </p>
              <p className={`text-xs mt-1 ${difficultyColor}`}>
                {difficultyName}
              </p>
            </div>
          )}
        </div>

        {/* Game Over Info - Above Grid */}
        {gameEnded && (
          <div className="text-center game-over-section">
            <h2 className="text-2xl font-bold mb-3 enhanced-game-over">
              Game Over
            </h2>
            <div className="flex gap-6 justify-center mb-4">
              <div className="enhanced-game-over-box rounded-lg px-8 py-4 text-center min-w-[120px]">
                <p className="text-slate-400 text-sm mb-1">Final Score</p>
                <p className="text-2xl font-bold text-yellow-400">{score}</p>
              </div>
              <div className="enhanced-game-over-box rounded-lg px-8 py-4 text-center min-w-[120px]">
                <p className="text-slate-400 text-sm mb-1">Reaction Time</p>
                <p className="text-xl font-bold text-red-400">
                  {lastReactionTime}ms
                </p>
              </div>
            </div>
            {score === highScore && score > 0 && (
              <p className="text-yellow-400 font-bold mb-3 enhanced-new-high-score">
                🏆 New High Score!
              </p>
            )}
          </div>
        )}

        {/* Game Grid - Keep the awesome styling */}
        <div className="game-grid-container">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-slate-600/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative grid grid-cols-3 gap-4 p-8 bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl">
              {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => handleClick(i, e)}
                  className="game-cell group"
                  style={{
                    userSelect: "none",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent", // Remove tap highlight on mobile
                  }}
                >
                  {activeCells.includes(i) && (
                    <div className="active-target">
                      <div className="target-ring"></div>
                      <div className="target-center"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button - Keep the awesome styling - Below Grid */}
        {!gameStarted && !gameEnded && (
          <div>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
              <button
                onClick={startGame}
                className="relative bg-slate-900 border-2 border-slate-700 hover:border-cyan-400/50 px-12 py-6 rounded-3xl text-2xl font-black shadow-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-blue-500/10"></div>
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-3xl animate-bounce">🎯</span>
                  <span className="text-white font-black text-2xl">
                    Start Game
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Try Again Button - Below Grid */}
        {gameEnded && (
          <div>
            <button
              onClick={startGame}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🔄 Try Again
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar - High Score History */}
      <div
        style={{
          position: "absolute",
          right: "16px",
          top: "185px",
          width: "20rem",
          zIndex: 10,
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        <div className="enhanced-score-box rounded-lg stats-box">
          <div className="stats-header">
            <h3 className="text-slate-400 text-sm font-semibold">
              High Score History
            </h3>
            <div className="text-emerald-400 font-bold text-lg mt-1">
              Best: {highScore} pts
            </div>
          </div>
          <div
            className="stats-content"
            style={{ maxHeight: "450px", overflowY: "auto" }}
          >
            {gameHistory.length > 0 ? (
              <div className="space-y-2">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className={`rounded text-xs game-history-entry ${
                      index === 0
                        ? "enhanced-history-entry-latest enhanced-history-entry"
                        : "enhanced-history-entry"
                    }`}
                  >
                    <div className="flex justify-between items-center score-line">
                      <span className="text-yellow-400 font-semibold">
                        {game.score} pts
                      </span>
                      {index === 0 && (
                        <span className="text-emerald-400 text-xs">Latest</span>
                      )}
                    </div>
                    <div className="flex justify-between text-slate-300 stats-line">
                      <span>Clicks: {game.clickCount}</span>
                      <span className="text-cyan-400">
                        {game.avgReactionTime}ms avg
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>{game.date}</span>
                      <span>{game.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-slate-400 text-xs text-center"
                style={{ padding: "24px 0" }}
              >
                No games played yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

