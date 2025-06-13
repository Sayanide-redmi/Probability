import React, { useState, useEffect } from 'react';
import './App.css';

const COIN_TYPES = {
  BASIC: { name: 'Basic', symbol: '🪙', buy: 1, sell: 1, tax: 0, interest: 0, limit: Infinity },
  SUPER: { name: 'Super', symbol: '⭐', buy: 10, sell: 15, tax: 3, interest: 0.05, interval: 120000, limit: 30 },
  MEGA: { name: 'Mega', symbol: '💠', buy: 30, sell: 45, tax: 6, interest: 0.15, interval: 180000, limit: 10 },
  HYPER: { name: 'Hyper', symbol: '🔷', buy: 59, sell: 95, tax: 9, interest: 0.40, interval: 300000, limit: 3 }
};

const SPECIAL_SYMBOLS = ['π', 'e', 'ρ', '∑', 'ψ', 'λ', 'ζ', '∞'];

const JACKPOT_GAMES = {
  'π': { name: '2D Chess', type: 'chess', reward: 'Coins + Tax Relief' },
  'e': { name: '2D UNO', type: 'uno', reward: 'Coins + Bonus Turn' },
  'ρ': { name: 'Minesweeper', type: 'minesweeper', reward: 'Score + Rare Bonus' },
  'ζ': { name: 'Card Duel', type: 'card', reward: 'Bonus Coins' },
  'ψ': { name: 'Math War', type: 'math', reward: 'Boost Coins' },
  '∑': { name: 'Puzzle Rush', type: 'puzzle', reward: 'Game Buff' },
  '∞': { name: 'Coin Storm', type: 'bonus', reward: 'Bonus Only' }
};

const REGULAR_GAMES = {
  0: 'Tap Score', 1: 'Memory Flip', 2: 'Rock Paper Scissors', 3: 'Dice Duel',
  4: 'Spin Wheel', 5: 'Quick Math', 6: 'Color Match', 7: 'Speed Click',
  8: 'Number Guess', 9: 'Pattern Match', 10: 'Lucky Draw'
};

function App() {
  // Game State
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, ended
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  
  // Player Stats
  const [coins, setCoins] = useState({
    basic: 10,
    super: 0,
    mega: 0,
    hyper: 0,
    reserve: { super: 0, mega: 0, hyper: 0 }
  });
  const [score, setScore] = useState(0);
  const [freeDraws, setFreeDraws] = useState(3);
  const [taxReduction, setTaxReduction] = useState(0);
  
  // Fortune Teller State
  const [fortuneState, setFortuneState] = useState('closed'); // closed, step1, step2, step3, result
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  
  // Current Game
  const [currentGame, setCurrentGame] = useState(null);
  const [gameResults, setGameResults] = useState([]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused, timeLeft]);

  // Interest Calculation Effect
  useEffect(() => {
    const intervals = [];
    
    // Super coins interest
    if (coins.super > 0) {
      intervals.push(setInterval(() => {
        setCoins(prev => ({
          ...prev,
          super: Math.min(prev.super + Math.floor(prev.super * COIN_TYPES.SUPER.interest), COIN_TYPES.SUPER.limit)
        }));
      }, COIN_TYPES.SUPER.interval));
    }
    
    // Mega coins interest
    if (coins.mega > 0) {
      intervals.push(setInterval(() => {
        setCoins(prev => ({
          ...prev,
          mega: Math.min(prev.mega + Math.floor(prev.mega * COIN_TYPES.MEGA.interest), COIN_TYPES.MEGA.limit)
        }));
      }, COIN_TYPES.MEGA.interval));
    }
    
    // Hyper coins interest
    if (coins.hyper > 0) {
      intervals.push(setInterval(() => {
        setCoins(prev => ({
          ...prev,
          hyper: Math.min(prev.hyper + Math.floor(prev.hyper * COIN_TYPES.HYPER.interest), COIN_TYPES.HYPER.limit)
        }));
      }, COIN_TYPES.HYPER.interval));
    }
    
    return () => intervals.forEach(clearInterval);
  }, [coins.super, coins.mega, coins.hyper]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(1800);
    setCoins({ basic: 10, super: 0, mega: 0, hyper: 0, reserve: { super: 0, mega: 0, hyper: 0 } });
    setScore(0);
    setFreeDraws(3);
    setTaxReduction(0);
    setFortuneState('closed');
    setGameResults([]);
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  const canDraw = () => {
    return freeDraws > 0 || coins.basic >= 1;
  };

  const drawFortune = () => {
    if (!canDraw()) return;
    
    if (freeDraws > 0) {
      setFreeDraws(prev => prev - 1);
    } else {
      setCoins(prev => ({ ...prev, basic: prev.basic - 1 }));
    }
    
    setFortuneState('step1');
  };

  const selectChoice = (choice) => {
    setSelectedChoice(choice);
    setFortuneState('step2');
  };

  const selectNumber = (num) => {
    setSelectedNumber(num);
    setFortuneState('step3');
    
    // Generate result after short delay for animation
    setTimeout(() => {
      const isSpecial = Math.random() < 0.15; // 15% chance for special symbol
      let result;
      
      if (isSpecial) {
        result = SPECIAL_SYMBOLS[Math.floor(Math.random() * SPECIAL_SYMBOLS.length)];
      } else {
        result = Math.floor(Math.random() * 11); // 0-10
      }
      
      setLastResult(result);
      setFortuneState('result');
      
      // Invalid number penalty
      if (!isSpecial && (result < 0 || result > 10)) {
        const penalty = Math.floor(Math.random() * 3) + 2; // 2-4 coins
        setCoins(prev => ({ ...prev, basic: Math.max(0, prev.basic - penalty) }));
      }
    }, 1500);
  };

  const playGame = (gameType) => {
    setIsPaused(true);
    setCurrentGame(gameType);
    
    if (SPECIAL_SYMBOLS.includes(gameType)) {
      // Jackpot game
      playJackpotGame(gameType);
    } else {
      // Regular game
      playRegularGame(gameType);
    }
  };

  const playRegularGame = (number) => {
    // Simulate simple game
    const won = Math.random() > 0.4; // 60% win rate
    const reward = won ? Math.floor(Math.random() * 5) + 2 : 0; // 2-6 coins
    const scoreGain = won ? Math.floor(Math.random() * 10) + 5 : 0; // 5-14 score
    
    setTimeout(() => {
      if (won) {
        setCoins(prev => ({ ...prev, basic: prev.basic + reward }));
        setScore(prev => prev + scoreGain);
        setTaxReduction(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
      
      setGameResults(prev => [...prev, {
        game: REGULAR_GAMES[number],
        won,
        reward,
        scoreGain,
        type: 'regular'
      }]);
      
      setCurrentGame(null);
      setIsPaused(false);
      setFortuneState('closed');
    }, 2000);
  };

  const playJackpotGame = (symbol) => {
    // Simulate jackpot game
    const won = Math.random() > 0.3; // 70% win rate
    const reward = won ? Math.floor(Math.random() * 20) + 10 : 0; // 10-29 coins
    const scoreGain = won ? Math.floor(Math.random() * 50) + 25 : 0; // 25-74 score
    
    setTimeout(() => {
      if (won) {
        setCoins(prev => ({ ...prev, basic: prev.basic + reward }));
        setScore(prev => prev + scoreGain);
        setTaxReduction(prev => prev + Math.floor(Math.random() * 5) + 3);
      }
      
      setGameResults(prev => [...prev, {
        game: JACKPOT_GAMES[symbol].name,
        won,
        reward,
        scoreGain,
        type: 'jackpot'
      }]);
      
      setCurrentGame(null);
      setIsPaused(false);
      setFortuneState('closed');
    }, 4000);
  };

  const buyCoin = (type) => {
    const coinType = COIN_TYPES[type.toUpperCase()];
    if (coins.basic >= coinType.buy) {
      const newAmount = coins[type] + 1;
      if (newAmount <= coinType.limit) {
        setCoins(prev => ({
          ...prev,
          basic: prev.basic - coinType.buy,
          [type]: newAmount
        }));
      } else {
        // Overflow to reserve
        setCoins(prev => ({
          ...prev,
          basic: prev.basic - coinType.buy,
          reserve: { ...prev.reserve, [type]: prev.reserve[type] + 1 }
        }));
      }
    }
  };

  const sellCoin = (type) => {
    const coinType = COIN_TYPES[type.toUpperCase()];
    if (coins[type] > 0) {
      const tax = Math.max(0, coinType.tax - taxReduction);
      const netGain = coinType.sell - tax;
      
      setCoins(prev => ({
        ...prev,
        [type]: prev[type] - 1,
        basic: prev.basic + netGain
      }));
      
      if (taxReduction > 0) {
        setTaxReduction(prev => Math.max(0, prev - coinType.tax));
      }
    }
  };

  const getTotalWealth = () => {
    return coins.basic + 
           (coins.super * COIN_TYPES.SUPER.sell) + 
           (coins.mega * COIN_TYPES.MEGA.sell) + 
           (coins.hyper * COIN_TYPES.HYPER.sell);
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
            🔮 Probability 6.0
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            A 30-minute fortune + finance challenge! Start with 10 coins and become as rich as possible through lucky draws, mini-games, and smart investments.
          </p>
          <button 
            onClick={startGame}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-2xl font-bold py-4 px-8 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            🎮 Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white p-8 bg-black bg-opacity-50 rounded-lg">
          <h1 className="text-4xl font-bold mb-4">🎉 Game Over!</h1>
          <div className="text-2xl mb-6">
            <p>Final Wealth: <span className="text-yellow-400">{getTotalWealth()} coins</span></p>
            <p>Final Score: <span className="text-green-400">{score}</span></p>
            <p>Games Played: <span className="text-blue-400">{gameResults.length}</span></p>
          </div>
          <button 
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xl font-bold py-3 px-6 rounded-full"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black bg-opacity-30 p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🔮 Probability 6.0</h1>
            <div className="text-lg">
              Time: <span className={`font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-green-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={pauseGame}
              className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <div className="text-lg">
              Score: <span className="text-green-400 font-bold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Coin Banking */}
        <div className="bg-black bg-opacity-40 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">💰 Banking System</h2>
          
          {/* Basic Coins */}
          <div className="mb-4 p-3 bg-gray-800 rounded">
            <div className="flex justify-between items-center">
              <span className="font-bold">🪙 Basic: {coins.basic}</span>
              <span className="text-sm text-gray-300">Starting currency</span>
            </div>
          </div>

          {/* Premium Coins */}
          {['super', 'mega', 'hyper'].map(type => {
            const coinType = COIN_TYPES[type.toUpperCase()];
            const currentAmount = coins[type];
            const reserveAmount = coins.reserve[type];
            const canBuy = coins.basic >= coinType.buy;
            const canSell = currentAmount > 0;
            
            return (
              <div key={type} className="mb-4 p-3 bg-gray-800 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">
                    {coinType.symbol} {coinType.name}: {currentAmount}
                    {reserveAmount > 0 && <span className="text-yellow-400"> (+{reserveAmount} reserve)</span>}
                  </span>
                  <span className="text-sm text-gray-300">
                    {(coinType.interest * 100).toFixed(0)}% every {coinType.interval/60000}min
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => buyCoin(type)}
                    disabled={!canBuy}
                    className={`px-3 py-1 rounded text-sm ${canBuy 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-600 cursor-not-allowed'}`}
                  >
                    Buy ({coinType.buy})
                  </button>
                  <button 
                    onClick={() => sellCoin(type)}
                    disabled={!canSell}
                    className={`px-3 py-1 rounded text-sm ${canSell 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-600 cursor-not-allowed'}`}
                  >
                    Sell ({coinType.sell - Math.max(0, coinType.tax - taxReduction)})
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Limit: {currentAmount}/{coinType.limit} | Tax: {Math.max(0, coinType.tax - taxReduction)}
                </div>
              </div>
            );
          })}

          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-800 to-orange-800 rounded">
            <div className="text-center">
              <div className="text-lg font-bold">Total Wealth</div>
              <div className="text-2xl text-yellow-400">{getTotalWealth()} coins</div>
            </div>
          </div>

          {taxReduction > 0 && (
            <div className="mt-2 p-2 bg-green-800 rounded text-center">
              <div className="text-sm">🛡️ Tax Reduction: {taxReduction}</div>
            </div>
          )}
        </div>

        {/* Center Panel - Fortune Teller */}
        <div className="bg-black bg-opacity-40 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔮 Fortune Teller</h2>
          
          <div className="text-center mb-4">
            <p className="text-sm text-gray-300">
              {freeDraws > 0 ? `${freeDraws} free draws left` : 'Cost: 1 basic coin per draw'}
            </p>
          </div>

          {fortuneState === 'closed' && (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-6xl">📋</div>
              </div>
              <button 
                onClick={drawFortune}
                disabled={!canDraw()}
                className={`px-6 py-3 rounded-lg font-bold ${canDraw() 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
              >
                {freeDraws > 0 ? '🎁 Draw Fortune (Free)' : '🪙 Draw Fortune (1 coin)'}
              </button>
            </div>
          )}

          {fortuneState === 'step1' && (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center animate-pulse">
                <div className="text-4xl">🔮</div>
              </div>
              <p className="mb-4 text-lg">Your Choice, Your Lucky Number</p>
              <div className="grid grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map(choice => (
                  <button 
                    key={choice}
                    onClick={() => selectChoice(choice)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fortuneState === 'step2' && (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center animate-bounce">
                <div className="text-4xl">✨</div>
              </div>
              <p className="mb-4 text-lg">Choice {selectedChoice} - Pick your number!</p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({length: 8}, (_, i) => (
                  <button 
                    key={i}
                    onClick={() => selectNumber(i + 1)}
                    className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white font-bold py-2 px-3 rounded transform hover:scale-105 transition-all duration-300"
                  >
                    {selectedChoice}{i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fortuneState === 'step3' && (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center animate-spin">
                <div className="text-4xl">🎰</div>
              </div>
              <p className="text-lg">Revealing your fortune...</p>
            </div>
          )}

          {fortuneState === 'result' && (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-gold-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg border-4 border-yellow-400">
                <div className="text-6xl">
                  {SPECIAL_SYMBOLS.includes(lastResult) ? lastResult : lastResult}
                </div>
              </div>
              <p className="text-lg mb-4">
                Your Fortune: <span className="font-bold text-yellow-400">{lastResult}</span>
              </p>
              
              {SPECIAL_SYMBOLS.includes(lastResult) ? (
                <div className="mb-4">
                  <p className="text-green-400 font-bold mb-2">🎊 JACKPOT GAME UNLOCKED!</p>
                  <p className="text-sm text-gray-300 mb-4">{JACKPOT_GAMES[lastResult].name}</p>
                  <button 
                    onClick={() => playGame(lastResult)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300"
                  >
                    🎮 Play {JACKPOT_GAMES[lastResult].name}
                  </button>
                </div>
              ) : lastResult >= 0 && lastResult <= 10 ? (
                <div className="mb-4">
                  <p className="text-blue-400 font-bold mb-2">🎯 Mini-Game Unlocked!</p>
                  <p className="text-sm text-gray-300 mb-4">{REGULAR_GAMES[lastResult]}</p>
                  <button 
                    onClick={() => playGame(lastResult)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300"
                  >
                    🎮 Play {REGULAR_GAMES[lastResult]}
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-red-400 font-bold mb-2">❌ Invalid Number!</p>
                  <p className="text-sm text-gray-300">2-4 coins deducted</p>
                </div>
              )}
              
              <button 
                onClick={() => setFortuneState('closed')}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Game Info & Results */}
        <div className="bg-black bg-opacity-40 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Game Info</h2>
          
          {/* Current Game */}
          {currentGame && (
            <div className="mb-6 p-4 bg-yellow-800 rounded-lg text-center">
              <p className="font-bold text-lg mb-2">🎮 Playing Game...</p>
              <p className="text-sm">
                {SPECIAL_SYMBOLS.includes(currentGame) 
                  ? JACKPOT_GAMES[currentGame].name 
                  : REGULAR_GAMES[currentGame]}
              </p>
              <div className="animate-spin text-2xl mt-2">⚡</div>
            </div>
          )}

          {/* Recent Results */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">🏆 Recent Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {gameResults.slice(-10).reverse().map((result, idx) => (
                <div key={idx} className={`p-2 rounded text-sm ${result.won ? 'bg-green-800' : 'bg-red-800'}`}>
                  <div className="flex justify-between">
                    <span className="font-bold">{result.game}</span>
                    <span>{result.won ? '✅' : '❌'}</span>
                  </div>
                  {result.won && (
                    <div className="text-xs text-gray-300">
                      +{result.reward} coins, +{result.scoreGain} score
                    </div>
                  )}
                </div>
              ))}
              {gameResults.length === 0 && (
                <p className="text-gray-400 text-sm">No games played yet</p>
              )}
            </div>
          </div>

          {/* Game Rules */}
          <div className="text-xs text-gray-300 space-y-1">
            <p><strong>Fortune Teller:</strong> 3 free draws, then 1 coin per draw</p>
            <p><strong>Numbers 0-10:</strong> Unlock mini-games</p>
            <p><strong>Special Symbols:</strong> Unlock jackpot games</p>
            <p><strong>Banking:</strong> Buy coins to earn interest over time</p>
            <p><strong>Tax Relief:</strong> Win games to reduce future taxes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;