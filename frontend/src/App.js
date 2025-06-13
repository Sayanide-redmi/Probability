import React, { useState, useEffect } from 'react';
import './App.css';

const COIN_TYPES = {
  BASIC: { name: 'Basic', symbol: '🪙', buy: 1, sell: 1, tax: 0, interest: 0, limit: Infinity },
  SUPER: { name: 'Super', symbol: '⭐', buy: 10, sell: 15, tax: 3, interest: 0.05, interval: 120000, limit: 30 },
  MEGA: { name: 'Mega', symbol: '💠', buy: 30, sell: 45, tax: 6, interest: 0.15, interval: 180000, limit: 10 },
  HYPER: { name: 'Hyper', symbol: '🔷', buy: 59, sell: 95, tax: 9, interest: 0.40, interval: 300000, limit: 3 }
};

const SPECIAL_SYMBOLS = ['π', 'e', 'ρ', '∑', 'ψ', 'λ', 'ζ', '∞'];
const REGULAR_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const JACKPOT_GAMES = {
  'π': { name: '2D Chess', type: 'chess', reward: 'Coins + Tax Relief', cost: 5 },
  'e': { name: '2D UNO', type: 'uno', reward: 'Coins + Bonus Turn', cost: 5 },
  'ρ': { name: 'Minesweeper', type: 'minesweeper', reward: 'Score + Rare Bonus', cost: 5 },
  'ζ': { name: 'Card Duel', type: 'card', reward: 'Bonus Coins', cost: 5 },
  'ψ': { name: 'Math War', type: 'math', reward: 'Boost Coins', cost: 5 },
  '∑': { name: 'Puzzle Rush', type: 'puzzle', reward: 'Game Buff', cost: 5 },
  'λ': { name: 'Memory Master', type: 'memory', reward: 'Super Bonus', cost: 5 },
  '∞': { name: 'Coin Storm', type: 'bonus', reward: 'Bonus Only', cost: 5 }
};

const REGULAR_GAMES = {
  0: { name: 'Tap Tap Win', type: 'tap', description: 'Tap screen to earn 0.1-0.5 coins' },
  1: { name: 'Vault Crack', type: 'memory', description: 'Memorize the pattern to crack the vault' },
  2: { name: 'Escape Maze', type: 'maze', description: 'Navigate through maze to earn coins' },
  3: { name: 'Color Match', type: 'color', description: 'Match colors quickly' },
  4: { name: 'Number Rush', type: 'math', description: 'Solve math problems fast' },
  5: { name: 'Pattern Lock', type: 'pattern', description: 'Unlock the pattern' },
  6: { name: 'Speed Click', type: 'speed', description: 'Click as fast as you can' },
  7: { name: 'Memory Cards', type: 'cards', description: 'Match pairs of cards' },
  8: { name: 'Reaction Test', type: 'reaction', description: 'Test your reflexes' },
  9: { name: 'Lucky Wheel', type: 'wheel', description: 'Spin the wheel of fortune' }
};

const TUTORIAL_STEPS = [
  {
    target: '.lucky-number-tab',
    title: 'Welcome to Probability 6.0!',
    content: 'This is your Lucky Number drawer. Click here to draw numbers and unlock games. You start with 3 free draws!'
  },
  {
    target: '.banking-panel',
    title: 'Banking System',
    content: 'Manage your coins here! Buy premium coins that earn interest over time. Super coins earn 5% every 2 minutes!'
  },
  {
    target: '.games-tab',
    title: 'Games Hub',
    content: 'After drawing valid numbers, come here to play games and earn rewards. Regular numbers unlock mini-games, special symbols unlock jackpot games!'
  },
  {
    target: '.timer-display',
    title: 'Game Timer',
    content: 'You have 30 minutes to become as rich as possible! The timer pauses during games.'
  },
  {
    target: '.wealth-display',
    title: 'Your Wealth',
    content: 'Track your total wealth here. Win games to reduce taxes and maximize your earnings!'
  }
];

function App() {
  // Game State
  const [gameState, setGameState] = useState('menu');
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('lucky');
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
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
  
  // Cooldown State
  const [cooldowns, setCooldowns] = useState({
    super: 0,
    mega: 0,
    hyper: 0
  });
  
  // Fortune Teller State
  const [fortuneState, setFortuneState] = useState('closed');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedFinal, setSelectedFinal] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [pendingGame, setPendingGame] = useState(null);
  
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

  // Cooldown Effect
  useEffect(() => {
    const intervals = [];
    Object.keys(cooldowns).forEach(type => {
      if (cooldowns[type] > 0) {
        intervals.push(setInterval(() => {
          setCooldowns(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] - 1)
          }));
        }, 1000));
      }
    });
    return () => intervals.forEach(clearInterval);
  }, [cooldowns]);

  // Interest Calculation Effect
  useEffect(() => {
    const intervals = [];
    
    if (coins.super > 0) {
      intervals.push(setInterval(() => {
        setCoins(prev => ({
          ...prev,
          super: Math.min(prev.super + Math.floor(prev.super * COIN_TYPES.SUPER.interest), COIN_TYPES.SUPER.limit)
        }));
      }, COIN_TYPES.SUPER.interval));
    }
    
    if (coins.mega > 0) {
      intervals.push(setInterval(() => {
        setCoins(prev => ({
          ...prev,
          mega: Math.min(prev.mega + Math.floor(prev.mega * COIN_TYPES.MEGA.interest), COIN_TYPES.MEGA.limit)
        }));
      }, COIN_TYPES.MEGA.interval));
    }
    
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
    setShowTutorial(true);
    setTutorialStep(0);
    setTimeLeft(1800);
    setCoins({ basic: 10, super: 0, mega: 0, hyper: 0, reserve: { super: 0, mega: 0, hyper: 0 } });
    setScore(0);
    setFreeDraws(3);
    setTaxReduction(0);
    setFortuneState('closed');
    setGameResults([]);
    setActiveTab('lucky');
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
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
  };

  const selectFinal = (final) => {
    setSelectedFinal(final);
    setFortuneState('step4');
    
    setTimeout(() => {
      // Determine result with proper probabilities
      const rand = Math.random();
      let result;
      
      if (rand < 0.05) { // 5% chance for jackpot
        result = SPECIAL_SYMBOLS[Math.floor(Math.random() * SPECIAL_SYMBOLS.length)];
      } else if (rand < 0.75) { // 70% chance for regular numbers
        result = REGULAR_NUMBERS[Math.floor(Math.random() * REGULAR_NUMBERS.length)];
      } else { // 25% chance for invalid number
        result = Math.floor(Math.random() * 20) + 11; // Invalid: 11-30
      }
      
      setLastResult(result);
      setFortuneState('result');
      
      // Handle invalid number penalty
      if (typeof result === 'number' && !REGULAR_NUMBERS.includes(result)) {
        const penalty = Math.floor(Math.random() * 3) + 2; // 2-4 coins
        setCoins(prev => ({ ...prev, basic: Math.max(0, prev.basic - penalty) }));
      } else if (REGULAR_NUMBERS.includes(result) || SPECIAL_SYMBOLS.includes(result)) {
        setPendingGame(result);
        setActiveTab('games');
      }
    }, 1500);
  };

  const buyGame = (gameKey) => {
    const isJackpot = SPECIAL_SYMBOLS.includes(gameKey);
    const cost = isJackpot ? 5 : 0; // Regular games are free, jackpot games cost 5 coins
    
    if (coins.basic >= cost) {
      if (cost > 0) {
        setCoins(prev => ({ ...prev, basic: prev.basic - cost }));
      }
      playGame(gameKey);
      setPendingGame(null);
    }
  };

  const playGame = (gameType) => {
    setIsPaused(true);
    setCurrentGame(gameType);
    
    if (SPECIAL_SYMBOLS.includes(gameType)) {
      playJackpotGame(gameType);
    } else {
      playRegularGame(gameType);
    }
  };

  const playRegularGame = (number) => {
    const gameInfo = REGULAR_GAMES[number];
    const won = Math.random() > 0.3; // 70% win rate
    let reward = 0;
    
    if (won) {
      switch(gameInfo.type) {
        case 'tap':
          reward = Math.random() * 0.4 + 0.1; // 0.1-0.5 coins
          break;
        case 'memory':
        case 'maze':
          reward = Math.floor(Math.random() * 5) + 3; // 3-7 coins
          break;
        default:
          reward = Math.floor(Math.random() * 3) + 2; // 2-4 coins
      }
    }
    
    const scoreGain = won ? Math.floor(Math.random() * 15) + 5 : 0;
    
    setTimeout(() => {
      if (won) {
        setCoins(prev => ({ ...prev, basic: prev.basic + Math.floor(reward) }));
        setScore(prev => prev + scoreGain);
        setTaxReduction(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
      
      setGameResults(prev => [...prev, {
        game: gameInfo.name,
        won,
        reward: Math.floor(reward),
        scoreGain,
        type: 'regular'
      }]);
      
      setCurrentGame(null);
      setIsPaused(false);
      setFortuneState('closed');
    }, 3000);
  };

  const playJackpotGame = (symbol) => {
    const gameInfo = JACKPOT_GAMES[symbol];
    const won = Math.random() > 0.2; // 80% win rate for paid games
    const reward = won ? Math.floor(Math.random() * 25) + 15 : 0; // 15-39 coins
    const scoreGain = won ? Math.floor(Math.random() * 60) + 40 : 0; // 40-99 score
    
    setTimeout(() => {
      if (won) {
        setCoins(prev => ({ ...prev, basic: prev.basic + reward }));
        setScore(prev => prev + scoreGain);
        setTaxReduction(prev => prev + Math.floor(Math.random() * 8) + 5);
      }
      
      setGameResults(prev => [...prev, {
        game: gameInfo.name,
        won,
        reward,
        scoreGain,
        type: 'jackpot'
      }]);
      
      setCurrentGame(null);
      setIsPaused(false);
      setFortuneState('closed');
    }, 5000);
  };

  const buyCoin = (type) => {
    const coinType = COIN_TYPES[type.toUpperCase()];
    if (coins.basic >= coinType.buy && cooldowns[type] === 0) {
      const newAmount = coins[type] + 1;
      if (newAmount <= coinType.limit) {
        setCoins(prev => ({
          ...prev,
          basic: prev.basic - coinType.buy,
          [type]: newAmount
        }));
      } else {
        setCoins(prev => ({
          ...prev,
          basic: prev.basic - coinType.buy,
          reserve: { ...prev.reserve, [type]: prev.reserve[type] + 1 }
        }));
      }
      
      // Set random cooldown 1-3 minutes
      const cooldownTime = Math.floor(Math.random() * 120) + 60; // 60-180 seconds
      setCooldowns(prev => ({ ...prev, [type]: cooldownTime }));
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

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center economic-bg">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center economic-bg">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white economic-bg">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 tutorial-overlay">
          <div className="absolute inset-0 bg-black bg-opacity-80"></div>
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white text-black p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">{TUTORIAL_STEPS[tutorialStep].title}</h3>
            <p className="mb-4">{TUTORIAL_STEPS[tutorialStep].content}</p>
            <div className="flex justify-between">
              <button 
                onClick={skipTutorial}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Skip Tutorial
              </button>
              <button 
                onClick={nextTutorialStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Start Playing!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black bg-opacity-30 p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🔮 Probability 6.0</h1>
            <div className="text-lg timer-display">
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
            <div className="text-lg wealth-display">
              Wealth: <span className="text-yellow-400 font-bold">{getTotalWealth()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black bg-opacity-20 border-b border-white border-opacity-20">
        <div className="max-w-6xl mx-auto flex">
          <button 
            onClick={() => setActiveTab('lucky')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'lucky' 
                ? 'bg-purple-600 text-white border-b-2 border-yellow-400' 
                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
            } lucky-number-tab`}
          >
            🍀 Lucky Number
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'games' 
                ? 'bg-purple-600 text-white border-b-2 border-yellow-400' 
                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
            } games-tab`}
          >
            🎮 Games Hub
          </button>
          <button 
            onClick={() => setActiveTab('banking')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'banking' 
                ? 'bg-purple-600 text-white border-b-2 border-yellow-400' 
                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            💰 Banking
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Lucky Number Tab */}
        {activeTab === 'lucky' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fortune Teller */}
            <div className="bg-black bg-opacity-40 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🍀 Lucky Number Drawer</h2>
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-300">
                  {freeDraws > 0 ? `${freeDraws} free draws left` : 'Cost: 1 basic coin per draw'}
                </p>
              </div>

              {fortuneState === 'closed' && (
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg fortune-paper">
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
                  <p className="mb-4 text-lg">Step 1: Choose Your Path</p>
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
                  <p className="mb-4 text-lg">Step 2: Path {selectedChoice} - Pick Number</p>
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
                  <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                    <div className="text-4xl">🎯</div>
                  </div>
                  <p className="mb-4 text-lg">Step 3: Final Choice - Pick 1, 2, or 3</p>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3].map(num => (
                      <button 
                        key={num}
                        onClick={() => selectFinal(num)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 text-2xl"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {fortuneState === 'step4' && (
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center animate-spin">
                    <div className="text-4xl">🎰</div>
                  </div>
                  <p className="text-lg">Revealing your lucky number...</p>
                  <p className="text-sm text-gray-300">
                    Path: {selectedChoice}{selectedNumber} → {selectedFinal}
                  </p>
                </div>
              )}

              {fortuneState === 'result' && (
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-gold-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg border-4 border-yellow-400">
                    <div className="text-6xl">
                      {lastResult}
                    </div>
                  </div>
                  <p className="text-lg mb-4">
                    Your Number: <span className="font-bold text-yellow-400">{lastResult}</span>
                  </p>
                  
                  {SPECIAL_SYMBOLS.includes(lastResult) ? (
                    <div className="mb-4">
                      <p className="text-yellow-400 font-bold mb-2">💰 JACKPOT SYMBOL!</p>
                      <p className="text-sm text-gray-300 mb-4">Go to Games tab to play for 5 coins</p>
                    </div>
                  ) : REGULAR_NUMBERS.includes(lastResult) ? (
                    <div className="mb-4">
                      <p className="text-green-400 font-bold mb-2">🎯 Valid Number!</p>
                      <p className="text-sm text-gray-300 mb-4">Go to Games tab to play for free</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-red-400 font-bold mb-2">❌ Invalid Number!</p>
                      <p className="text-sm text-gray-300">Coins deducted automatically</p>
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

            {/* Mini Banking Panel */}
            <div className="bg-black bg-opacity-40 rounded-lg p-6 banking-panel">
              <h2 className="text-xl font-bold mb-4">💰 Quick Banking</h2>
              
              <div className="mb-4 p-3 bg-gray-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-bold">🪙 Basic: {coins.basic}</span>
                  <span className="text-sm text-gray-300">Main currency</span>
                </div>
              </div>

              <div className="space-y-3">
                {['super', 'mega', 'hyper'].map(type => {
                  const coinType = COIN_TYPES[type.toUpperCase()];
                  const canBuy = coins.basic >= coinType.buy && cooldowns[type] === 0;
                  
                  return (
                    <div key={type} className="p-3 bg-gray-800 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">
                          {coinType.symbol} {coinType.name}: {coins[type]}
                        </span>
                        {cooldowns[type] > 0 && (
                          <span className="text-red-400 text-sm">
                            ⏰ {formatCooldown(cooldowns[type])}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => buyCoin(type)}
                        disabled={!canBuy}
                        className={`w-full px-3 py-1 rounded text-sm ${canBuy 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-600 cursor-not-allowed'}`}
                      >
                        Buy ({coinType.buy} coins)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Games */}
            <div className="bg-black bg-opacity-40 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🎮 Available Games</h2>
              
              {pendingGame !== null ? (
                <div className="mb-6 p-4 bg-green-800 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">🎯 Game Unlocked!</h3>
                  
                  {SPECIAL_SYMBOLS.includes(pendingGame) ? (
                    <div>
                      <p className="text-yellow-400 font-bold">{JACKPOT_GAMES[pendingGame].name}</p>
                      <p className="text-sm text-gray-300 mb-3">{JACKPOT_GAMES[pendingGame].reward}</p>
                      <button 
                        onClick={() => buyGame(pendingGame)}
                        disabled={coins.basic < 5}
                        className={`w-full py-2 px-4 rounded font-bold ${
                          coins.basic >= 5 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Play for 5 coins
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-400 font-bold">{REGULAR_GAMES[pendingGame].name}</p>
                      <p className="text-sm text-gray-300 mb-3">{REGULAR_GAMES[pendingGame].description}</p>
                      <button 
                        onClick={() => buyGame(pendingGame)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-bold"
                      >
                        Play for Free
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>🎲 Draw a lucky number to unlock games!</p>
                  <p className="text-sm mt-2">Regular numbers (0-9) = Free mini-games</p>
                  <p className="text-sm">Special symbols = Jackpot games (5 coins)</p>
                </div>
              )}

              {/* Current Game */}
              {currentGame && (
                <div className="mb-6 p-4 bg-blue-800 rounded-lg text-center">
                  <p className="font-bold text-lg mb-2">🎮 Playing Game...</p>
                  <p className="text-sm">
                    {SPECIAL_SYMBOLS.includes(currentGame) 
                      ? JACKPOT_GAMES[currentGame].name 
                      : REGULAR_GAMES[currentGame].name}
                  </p>
                  <div className="animate-spin text-2xl mt-2">⚡</div>
                </div>
              )}
            </div>

            {/* Game Results */}
            <div className="bg-black bg-opacity-40 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏆 Game Results</h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gameResults.slice(-15).reverse().map((result, idx) => (
                  <div key={idx} className={`p-3 rounded ${result.won ? 'bg-green-800' : 'bg-red-800'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{result.game}</span>
                      <span className="text-lg">{result.won ? '✅' : '❌'}</span>
                    </div>
                    {result.won && (
                      <div className="text-sm text-gray-300 mt-1">
                        +{result.reward} coins, +{result.scoreGain} score
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {result.type === 'jackpot' ? '💰 Jackpot Game' : '🎯 Mini Game'}
                    </div>
                  </div>
                ))}
                {gameResults.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No games played yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === 'banking' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coin Management */}
            <div className="bg-black bg-opacity-40 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">💰 Coin Management</h2>
              
              <div className="mb-4 p-3 bg-gray-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-bold">🪙 Basic: {coins.basic}</span>
                  <span className="text-sm text-gray-300">Starting currency</span>
                </div>
              </div>

              {['super', 'mega', 'hyper'].map(type => {
                const coinType = COIN_TYPES[type.toUpperCase()];
                const currentAmount = coins[type];
                const reserveAmount = coins.reserve[type];
                const canBuy = coins.basic >= coinType.buy && cooldowns[type] === 0;
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
                    
                    {cooldowns[type] > 0 && (
                      <div className="mb-2 text-center">
                        <span className="text-red-400 text-sm">
                          ⏰ Cooldown: {formatCooldown(cooldowns[type])}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => buyCoin(type)}
                        disabled={!canBuy}
                        className={`px-3 py-1 rounded text-sm flex-1 ${canBuy 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-600 cursor-not-allowed'}`}
                      >
                        Buy ({coinType.buy})
                      </button>
                      <button 
                        onClick={() => sellCoin(type)}
                        disabled={!canSell}
                        className={`px-3 py-1 rounded text-sm flex-1 ${canSell 
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
            </div>

            {/* Wealth Summary */}
            <div className="space-y-6">
              <div className="bg-black bg-opacity-40 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">📊 Wealth Summary</h2>
                
                <div className="p-4 bg-gradient-to-r from-yellow-800 to-orange-800 rounded mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">Total Wealth</div>
                    <div className="text-3xl text-yellow-400">{getTotalWealth()} coins</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Coins:</span>
                    <span className="text-yellow-400">{coins.basic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Super Value:</span>
                    <span className="text-yellow-400">{coins.super * COIN_TYPES.SUPER.sell}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mega Value:</span>
                    <span className="text-yellow-400">{coins.mega * COIN_TYPES.MEGA.sell}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hyper Value:</span>
                    <span className="text-yellow-400">{coins.hyper * COIN_TYPES.HYPER.sell}</span>
                  </div>
                </div>
              </div>

              {taxReduction > 0 && (
                <div className="bg-black bg-opacity-40 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-2">🛡️ Tax Benefits</h3>
                  <div className="p-3 bg-green-800 rounded text-center">
                    <div className="text-2xl text-green-400">{taxReduction}</div>
                    <div className="text-sm">Tax Reduction Points</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;