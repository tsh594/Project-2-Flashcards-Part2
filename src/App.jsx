import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import './App.css';

const cards = [
  { 
    id: 1, 
    question: "What is React?", 
    answer: "A JavaScript library for building user interfaces",
    category: 'basics'
  },
  { 
    id: 2, 
    question: "What is JSX?", 
    answer: "Syntax extension for JavaScript that looks like HTML",
    category: 'syntax'
  },
  { 
    id: 3, 
    question: "What is a component?", 
    answer: "Building blocks of React applications",
    category: 'concepts'
  },
  { 
    id: 4, 
    question: "What is virtual DOM?", 
    answer: "Lightweight representation of the real DOM",
    category: 'performance'
  },
  { 
    id: 5,
    question: "What's this component?",
    answer: "React Context Provider",
    category: 'patterns',
    image: '/component.jpg'
  },
  { 
    id: 6, 
    question: "What's this UI pattern?", 
    answer: "Dropdown menu",
    category: 'components',
    image: '/drop-down-UI-pattern.png'
  },
  { 
    id: 7, 
    question: "Which hook is this?", 
    answer: "useState()",
    category: 'hooks',
    image: '/usestate.jpeg'
  },
  { 
    id: 8, 
    question: "What architecture is this?", 
    answer: "Component-based architecture",
    category: 'architecture',
    image: '/component-based-arch.png'
  },
  { 
    id: 9, 
    question: "What tool is this?", 
    answer: "React Developer Tools",
    category: 'tools',
    image: '/react-devtools-standalone.png'
  },
  {
    id: 10, 
    question: "What's this cloud pattern?", 
    answer: "Cloud Storage Architecture",
    category: 'cloud',
    image: '/Generic-cloud-storage-architecture.png'
  }
];

function App() {
  const [currentDeck, setCurrentDeck] = useState([...cards]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [masteredCards, setMasteredCards] = useState([]);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [showMasteredModal, setShowMasteredModal] = useState(false);
  const [showFlipWarning, setShowFlipWarning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentCard = currentDeck[currentCardIndex] || {};

  useEffect(() => {
    if (currentDeck.length === 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentDeck]);

  const fuzzyMatch = (answer, correct) => {
    const normalize = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return normalize(answer).includes(normalize(correct)) || 
           normalize(correct).includes(normalize(answer));
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setShowEmptyWarning(true);
      setIsCorrect(null);
      return;
    }
    setShowEmptyWarning(false);

    const correct = fuzzyMatch(userAnswer, currentCard.answer);
    setIsCorrect(correct);
    
    if (correct) {
      setIsFlipped(true);
      setIncorrectAttempts(0);
    } else {
      setIncorrectAttempts(prev => {
        if (prev + 1 >= 2) {
          setIsFlipped(true); // Automatically flip the card after 2 incorrect attempts
          return 0;
        }
        return prev + 1;
      });
    }

    setCurrentStreak(prev => {
      const newStreak = correct ? prev + 1 : 0;
      if (newStreak > longestStreak) setLongestStreak(newStreak);
      return newStreak;
    });
  };

  const resetCard = () => {
    setIsFlipped(false);
    setUserAnswer('');
    setIsCorrect(null);
    setIncorrectAttempts(0);
    setShowEmptyWarning(false);
    setShowFlipWarning(false);
  };

  const handleCardFlip = () => {
    if (incorrectAttempts < 2 && !isFlipped) {
      setShowFlipWarning(true);
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const markAsMastered = () => {
    if (currentDeck.length === 0) {
      setShowMasteredModal(true);
      return;
    }
    
    setMasteredCards(prev => [...prev, currentCard]);
    setCurrentDeck(prev => prev.filter(card => card.id !== currentCard.id));
    setCurrentCardIndex(prev => Math.min(prev, currentDeck.length - 2));
    resetCard();
  };

  const handleNext = () => {
    setCurrentCardIndex(prev => (prev + 1) % currentDeck.length);
    resetCard();
  };

  const handleBack = () => {
    setCurrentCardIndex(prev => (prev - 1 + currentDeck.length) % currentDeck.length);
    resetCard();
  };

  const shuffleDeck = () => {
    setCurrentDeck(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    resetCard();
  };

  return (
    <div className="App">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={500} />}

      {showMasteredModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🎉 All Cards Mastered! 🎉</h2>
            <p>You've successfully mastered all cards!</p>
            <button 
              className="control-btn" 
              onClick={() => setShowMasteredModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="header">
        <h1>React Flashcards</h1>
        <p>Learn React concepts through interactive cards</p>
        <div className="stats">
          <p className="card-count">Cards remaining: {currentDeck.length}</p>
          <p className="streak">🔥 Current Streak: {currentStreak} | 🏆 Longest Streak: {longestStreak}</p>
        </div>
      </div>

      {currentDeck.length > 0 ? (
        <>
          <div 
            className={`flashcard-container ${currentCard.category}`} 
            onClick={handleCardFlip}
          >
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
              <div className="front">
                {currentCard.image && (
                  <img src={currentCard.image} alt="Visual question" className="card-image" />
                )}
                <div className="question-content">
                  <div className="question-text">{currentCard.question}</div>
                  <div className="category-tag">{currentCard.category}</div>
                </div>
              </div>
              <div className="back">
                <div className="answer-content">
                  <p>{currentCard.answer}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="input-container">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className={`answer-input ${
                isCorrect !== null 
                  ? (isCorrect ? 'correct' : 'incorrect')
                  : showEmptyWarning ? 'warning' : ''
              }`}
            />
            <button className="submit-btn" onClick={checkAnswer}>
              Check Answer
            </button>
            {showEmptyWarning && (
              <p className="error-message">Please enter an answer before checking!</p>
            )}
            {showFlipWarning && (
              <p className="error-message">You need 2 incorrect attempts before flipping!</p>
            )}
          </div>
        </>
      ) : (
        <div className="mastered">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You've mastered all cards!</p>
          <button 
            className="control-btn" 
            onClick={() => setCurrentDeck([...masteredCards])}
          >
            Reset Deck
          </button>
        </div>
      )}

      <div className="navigation">
        <button className="nav-btn" onClick={handleBack}>← Back</button>
        <button className="nav-btn" onClick={handleNext}>Next →</button>
      </div>

      <div className="controls">
        <button className="control-btn shuffle" onClick={shuffleDeck}>
          🔀 Shuffle Deck
        </button>
        <button className="control-btn master" onClick={markAsMastered}>
          ✅ Mark Mastered
        </button>
      </div>

      {masteredCards.length > 0 && (
        <div className="mastered">
          <h3>Mastered Cards ({masteredCards.length})</h3>
          <ul>
            {masteredCards.map(card => (
              <li key={card.id}>{card.question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;