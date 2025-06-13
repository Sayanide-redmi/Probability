import React, { useState, useEffect, useCallback } from 'react';

// Tap Tap Win Game (Number 0)
export const TapTapWin = ({ onGameEnd }) => {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const endGame = () => {
    setGameActive(false);
    const coinsEarned = Math.floor(taps * 0.1);
    const score = taps * 2;
    onGameEnd(true, coinsEarned, score);
  };

  const handleTap = () => {
    if (gameActive) {
      setTaps(taps + 1);
    }
  };

  return (
    <div className="bg-blue-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">🖱️ Tap Tap Win</h2>
      <div className="mb-4">
        <div className="text-3xl font-bold text-yellow-400">{taps}</div>
        <div className="text-sm">Taps</div>
      </div>
      <div className="mb-4">
        <div className="text-2xl font-bold text-red-400">{timeLeft}</div>
        <div className="text-sm">Seconds Left</div>
      </div>
      <button 
        onClick={handleTap}
        disabled={!gameActive}
        className="w-32 h-32 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-full text-4xl font-bold disabled:opacity-50"
      >
        TAP!
      </button>
      <div className="mt-4 text-sm text-gray-300">
        Earn 0.1 coins per tap!
      </div>
    </div>
  );
};

// Vault Crack Game (Number 1)
export const VaultCrack = ({ onGameEnd }) => {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [gamePhase, setGamePhase] = useState('memorize'); // memorize, input, result
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    // Generate random sequence
    const newSequence = [];
    for (let i = 0; i < 6; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);
    
    // Show sequence for 3 seconds
    setTimeout(() => {
      setShowSequence(false);
      setGamePhase('input');
    }, 3000);
  }, []);

  const handleButtonClick = (num) => {
    if (gamePhase !== 'input') return;
    
    const newInput = [...userInput, num];
    setUserInput(newInput);
    
    if (newInput.length === sequence.length) {
      // Check if sequence matches
      const isCorrect = newInput.every((val, idx) => val === sequence[idx]);
      const coinsEarned = isCorrect ? 8 : 0;
      const score = isCorrect ? 50 : 0;
      setGamePhase('result');
      setTimeout(() => onGameEnd(isCorrect, coinsEarned, score), 1500);
    }
  };

  const buttons = [
    { num: 0, color: 'bg-red-500', label: '🔴' },
    { num: 1, color: 'bg-blue-500', label: '🔵' },
    { num: 2, color: 'bg-green-500', label: '🟢' },
    { num: 3, color: 'bg-yellow-500', label: '🟡' }
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">🔐 Vault Crack</h2>
      
      {gamePhase === 'memorize' && (
        <div className="mb-4">
          <div className="text-lg mb-2">Memorize the sequence:</div>
          <div className="flex justify-center space-x-2 mb-4">
            {sequence.map((num, idx) => (
              <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                idx <= sequenceIndex ? buttons[num].color : 'bg-gray-600'
              }`}>
                {idx <= sequenceIndex ? buttons[num].label : '?'}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {gamePhase === 'input' && (
        <div className="mb-4">
          <div className="text-lg mb-2">Enter the sequence:</div>
          <div className="flex justify-center space-x-2 mb-4">
            {sequence.map((_, idx) => (
              <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                userInput[idx] !== undefined ? buttons[userInput[idx]].color : 'bg-gray-600'
              }`}>
                {userInput[idx] !== undefined ? buttons[userInput[idx]].label : '?'}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {gamePhase === 'result' && (
        <div className="mb-4">
          <div className="text-2xl font-bold text-green-400">
            {userInput.every((val, idx) => val === sequence[idx]) ? '✅ Success!' : '❌ Failed!'}
          </div>
        </div>
      )}
      
      {gamePhase === 'input' && (
        <div className="grid grid-cols-2 gap-4 max-w-64 mx-auto">
          {buttons.map((button) => (
            <button
              key={button.num}
              onClick={() => handleButtonClick(button.num)}
              className={`w-20 h-20 rounded-full text-3xl font-bold hover:scale-105 transition-transform ${button.color}`}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Escape Maze Game (Number 2)
export const EscapeMaze = ({ onGameEnd }) => {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  
  const maze = [
    [0, 0, 1, 1, 1, 1, 1, 3],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
      onGameEnd(false, 0, 0);
    }
  }, [timeLeft, gameActive]);

  useEffect(() => {
    // Check if player reached exit (3)
    if (maze[playerPos.y] && maze[playerPos.y][playerPos.x] === 3) {
      setGameActive(false);
      const coinsEarned = Math.floor(timeLeft / 2) + 5;
      const score = timeLeft * 3;
      onGameEnd(true, coinsEarned, score);
    }
  }, [playerPos]);

  const movePlayer = (dx, dy) => {
    if (!gameActive) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (newY >= 0 && newY < maze.length && newX >= 0 && newX < maze[0].length) {
      if (maze[newY][newX] !== 1) { // Not a wall
        setPlayerPos({ x: newX, y: newY });
      }
    }
  };

  const handleKeyPress = useCallback((e) => {
    switch(e.key) {
      case 'ArrowUp': movePlayer(0, -1); break;
      case 'ArrowDown': movePlayer(0, 1); break;
      case 'ArrowLeft': movePlayer(-1, 0); break;
      case 'ArrowRight': movePlayer(1, 0); break;
    }
  }, [gameActive, playerPos]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="bg-green-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">🚪 Escape Maze</h2>
      <div className="mb-4">
        <div className="text-xl font-bold text-red-400">{timeLeft}s</div>
        <div className="text-sm">Time Left</div>
      </div>
      
      <div className="grid grid-cols-8 gap-1 max-w-xs mx-auto mb-4">
        {maze.map((row, y) => 
          row.map((cell, x) => (
            <div key={`${x}-${y}`} className={`w-8 h-8 flex items-center justify-center text-sm ${
              playerPos.x === x && playerPos.y === y ? 'bg-blue-500 text-white' : 
              cell === 1 ? 'bg-gray-800' : 
              cell === 3 ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {playerPos.x === x && playerPos.y === y ? '🚶' : 
               cell === 3 ? '🚪' : 
               cell === 1 ? '⬛' : ''}
            </div>
          ))
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto mb-4">
        <div></div>
        <button onClick={() => movePlayer(0, -1)} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">↑</button>
        <div></div>
        <button onClick={() => movePlayer(-1, 0)} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">←</button>
        <div></div>
        <button onClick={() => movePlayer(1, 0)} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">→</button>
        <div></div>
        <button onClick={() => movePlayer(0, 1)} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">↓</button>
        <div></div>
      </div>
      
      <div className="text-sm text-gray-300">
        Use arrows or buttons to reach the exit 🚪
      </div>
    </div>
  );
};

// Speed Click Game (Number 6)
export const SpeedClick = ({ onGameEnd }) => {
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
      const coinsEarned = Math.floor(score / 2);
      const finalScore = score * 5;
      onGameEnd(score > 15, coinsEarned, finalScore);
    }
  }, [timeLeft, gameActive]);

  const moveTarget = () => {
    if (!gameActive) return;
    setTarget({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20
    });
    setScore(score + 1);
  };

  return (
    <div className="bg-red-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">⚡ Speed Click</h2>
      <div className="flex justify-between mb-4">
        <div>
          <div className="text-xl font-bold text-yellow-400">{score}</div>
          <div className="text-sm">Hits</div>
        </div>
        <div>
          <div className="text-xl font-bold text-red-400">{timeLeft}</div>
          <div className="text-sm">Seconds</div>
        </div>
      </div>
      
      <div className="relative w-full h-64 bg-gray-800 rounded-lg mb-4 overflow-hidden">
        {gameActive && (
          <button
            onClick={moveTarget}
            className="absolute w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
          >
            🎯
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-300">
        Click the target as fast as you can! Need 15+ hits to win.
      </div>
    </div>
  );
};

// Memory Cards Game (Number 7)
export const MemoryCards = ({ onGameEnd }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯'];

  useEffect(() => {
    // Initialize cards
    const shuffledCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
    setCards(shuffledCards);
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].symbol === cards[second].symbol) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameComplete(true);
      const coinsEarned = Math.max(10 - moves, 3);
      const score = Math.max(50 - moves * 2, 20);
      setTimeout(() => onGameEnd(true, coinsEarned, score), 1000);
    }
  }, [matched, cards.length]);

  const handleCardClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  return (
    <div className="bg-purple-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">🃏 Memory Cards</h2>
      <div className="mb-4">
        <div className="text-lg">Moves: <span className="font-bold text-yellow-400">{moves}</span></div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-4">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`w-16 h-16 text-2xl font-bold rounded-lg transition-all duration-300 ${
              flipped.includes(index) || matched.includes(index)
                ? 'bg-white text-black'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {flipped.includes(index) || matched.includes(index) ? card.symbol : '?'}
          </button>
        ))}
      </div>
      
      <div className="text-sm text-gray-300">
        {gameComplete ? '🎉 Complete!' : 'Match all pairs with fewer moves for more coins!'}
      </div>
    </div>
  );
};

// Simple Minesweeper (Jackpot ρ)
export const Minesweeper = ({ onGameEnd }) => {
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  const BOARD_SIZE = 6;
  const MINE_COUNT = 8;

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    
    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (newBoard[row][col] !== -1) {
        newBoard[row][col] = -1;
        minesPlaced++;
        
        // Update adjacent cells
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && newBoard[newRow][newCol] !== -1) {
              newBoard[newRow][newCol]++;
            }
          }
        }
      }
    }
    setBoard(newBoard);
  };

  const revealCell = (row, col) => {
    if (gameOver || gameWon || revealed.includes(`${row}-${col}`) || flagged.includes(`${row}-${col}`)) return;
    
    const newRevealed = [...revealed, `${row}-${col}`];
    setRevealed(newRevealed);
    
    if (board[row][col] === -1) {
      setGameOver(true);
      setTimeout(() => onGameEnd(false, 0, 0), 1500);
    } else {
      // Check win condition
      const totalCells = BOARD_SIZE * BOARD_SIZE;
      if (newRevealed.length === totalCells - MINE_COUNT) {
        setGameWon(true);
        setTimeout(() => onGameEnd(true, 25, 80), 1500);
      }
    }
  };

  const toggleFlag = (row, col, e) => {
    e.preventDefault();
    if (gameOver || gameWon || revealed.includes(`${row}-${col}`)) return;
    
    const cellKey = `${row}-${col}`;
    if (flagged.includes(cellKey)) {
      setFlagged(flagged.filter(f => f !== cellKey));
    } else {
      setFlagged([...flagged, cellKey]);
    }
  };

  const getCellDisplay = (row, col) => {
    const cellKey = `${row}-${col}`;
    const isRevealed = revealed.includes(cellKey);
    const isFlagged = flagged.includes(cellKey);
    const cellValue = board[row] && board[row][col];
    
    if (isFlagged) return '🚩';
    if (!isRevealed) return '';
    if (cellValue === -1) return '💣';
    if (cellValue === 0) return '';
    return cellValue;
  };

  const getCellClass = (row, col) => {
    const cellKey = `${row}-${col}`;
    const isRevealed = revealed.includes(cellKey);
    const isFlagged = flagged.includes(cellKey);
    const cellValue = board[row] && board[row][col];
    
    if (gameOver && cellValue === -1) return 'bg-red-600';
    if (isRevealed) return cellValue === -1 ? 'bg-red-600' : 'bg-gray-300 text-black';
    if (isFlagged) return 'bg-yellow-600';
    return 'bg-gray-600 hover:bg-gray-500';
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">💣 Minesweeper</h2>
      <div className="mb-4">
        <div className="text-sm">Mines: {MINE_COUNT} | Flags: {flagged.length}</div>
        {gameOver && <div className="text-red-400 font-bold">💥 Game Over!</div>}
        {gameWon && <div className="text-green-400 font-bold">🎉 You Won!</div>}
      </div>
      
      <div className="grid grid-cols-6 gap-1 max-w-xs mx-auto mb-4">
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => revealCell(rowIndex, colIndex)}
              onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
              className={`w-8 h-8 text-sm font-bold border border-gray-400 ${getCellClass(rowIndex, colIndex)}`}
            >
              {getCellDisplay(rowIndex, colIndex)}
            </button>
          ))
        )}
      </div>
      
      <div className="text-xs text-gray-300">
        Left click to reveal, right click to flag. Clear all safe cells to win!
      </div>
    </div>
  );
};

// Simple UNO Game (Jackpot e)
export const UnoGame = ({ onGameEnd }) => {
  const [playerCards, setPlayerCards] = useState([]);
  const [aiCards, setAiCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [gamePhase, setGamePhase] = useState('playing'); // playing, won, lost
  
  const colors = ['red', 'blue', 'green', 'yellow'];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  useEffect(() => {
    initializeGame();
  }, []);

  const createDeck = () => {
    const deck = [];
    colors.forEach(color => {
      numbers.forEach(number => {
        deck.push({ color, number, id: `${color}-${number}-${Math.random()}` });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const initializeGame = () => {
    const deck = createDeck();
    const playerHand = deck.slice(0, 7);
    const aiHand = deck.slice(7, 14);
    const startCard = deck[14];
    
    setPlayerCards(playerHand);
    setAiCards(aiHand);
    setCurrentCard(startCard);
  };

  const canPlayCard = (card) => {
    if (!currentCard) return true;
    return card.color === currentCard.color || card.number === currentCard.number;
  };

  const playCard = (cardIndex) => {
    const card = playerCards[cardIndex];
    if (!canPlayCard(card)) return;
    
    setCurrentCard(card);
    const newPlayerCards = playerCards.filter((_, index) => index !== cardIndex);
    setPlayerCards(newPlayerCards);
    
    if (newPlayerCards.length === 0) {
      setGamePhase('won');
      setTimeout(() => onGameEnd(true, 20, 70), 1500);
      return;
    }
    
    // AI turn
    setTimeout(() => {
      aiTurn();
    }, 1000);
  };

  const aiTurn = () => {
    const playableCards = aiCards.filter(card => canPlayCard(card));
    
    if (playableCards.length > 0) {
      const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
      setCurrentCard(cardToPlay);
      const newAiCards = aiCards.filter(card => card.id !== cardToPlay.id);
      setAiCards(newAiCards);
      
      if (newAiCards.length === 0) {
        setGamePhase('lost');
        setTimeout(() => onGameEnd(false, 0, 0), 1500);
      }
    }
  };

  const drawCard = () => {
    const newCard = {
      color: colors[Math.floor(Math.random() * colors.length)],
      number: numbers[Math.floor(Math.random() * numbers.length)],
      id: `drawn-${Math.random()}`
    };
    setPlayerCards([...playerCards, newCard]);
    
    // AI turn after draw
    setTimeout(() => aiTurn(), 500);
  };

  const getCardColor = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="bg-blue-900 p-6 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">🃏 UNO</h2>
      
      <div className="mb-4">
        <div className="text-sm">AI Cards: {aiCards.length}</div>
        <div className="flex justify-center">
          {Array(aiCards.length).fill().map((_, index) => (
            <div key={index} className="w-8 h-12 bg-gray-700 border border-gray-500 -ml-2 rounded"></div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-lg mb-2">Current Card:</div>
        {currentCard && (
          <div className={`w-16 h-24 mx-auto rounded-lg ${getCardColor(currentCard.color)} flex items-center justify-center text-white text-2xl font-bold`}>
            {currentCard.number}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="text-sm mb-2">Your Cards:</div>
        <div className="flex justify-center space-x-2 flex-wrap">
          {playerCards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => playCard(index)}
              disabled={!canPlayCard(card)}
              className={`w-12 h-18 rounded-lg ${getCardColor(card.color)} flex items-center justify-center text-white font-bold mb-2 ${
                canPlayCard(card) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {card.number}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={drawCard}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
      >
        Draw Card
      </button>
      
      {gamePhase === 'won' && <div className="text-green-400 font-bold mt-4">🎉 You Won!</div>}
      {gamePhase === 'lost' && <div className="text-red-400 font-bold mt-4">😞 AI Won!</div>}
      
      <div className="text-xs text-gray-300 mt-2">
        Play cards with matching color or number!
      </div>
    </div>
  );
};