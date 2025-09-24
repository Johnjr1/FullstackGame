import { useState, useEffect } from 'react';
import './App.css';
import BubbleTitle from './BubbleTitle';
import './bubbles.js';

function App() {
  const [userGuess, setUserGuess] = useState('');
  const [result, setResult] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [correctNumber, setCorrectNumber] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const maxAttempts = 5;

  const handleGuess = () => {
    if (guesses.length >= maxAttempts) return;

    // ✅ Changed: Use relative URL for API call
    fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess: userGuess })
    })
      .then(res => res.json())
      .then(data => {
        setResult(data.result);
        setGuesses(prev => [...prev, userGuess]);
        if (data.correctNumber !== undefined) {
          setCorrectNumber(data.correctNumber);
        } else if (data.result === 'correct') {
          setCorrectNumber(userGuess);
        }
        setUserGuess('');
      });
  };

  const handleRestart = () => {
    setUserGuess('');
    setResult('');
    setGuesses([]);
    setCorrectNumber(null);

    // ✅ Changed: Use relative URL for API call
    fetch('/api/restart', {
      method: 'POST'
    });
  };

  const isGameOver = guesses.length >= maxAttempts || result === 'correct';

 const handleThemeToggle = () => {
  const newTheme = !isDarkMode;
  setIsDarkMode(newTheme);

  document.body.classList.remove('light', 'dark');
  document.body.classList.add(newTheme ? 'dark' : 'light');

  // Force repaint hack to fix mobile gradient update issue:
  document.body.style.display = 'none';
  // Trigger reflow
  void document.body.offsetHeight;
  document.body.style.display = '';

  // Dispatch event for bubbles
  const event = new CustomEvent("themeSwitch", { detail: newTheme ? "dark" : "light" });
  window.dispatchEvent(event);
};

  useEffect(() => {
    document.body.classList.add('light');
  }, []);

  const getResponsiveFontSize = (baseSize) => {
    if (window.innerWidth <= 480) return baseSize * 0.5;
    if (window.innerWidth <= 768) return baseSize * 0.7;
    return baseSize;
  };

  return (
    <div className="App">
      <div className="intro">
        <header className="App-header">
          <BubbleTitle text="Guess a number" radius={150} totalArc={50} fontSize={getResponsiveFontSize(4)} verticalOffset={window.innerWidth <= 480 ? "0.2em" : "0.5em"} />
          <BubbleTitle text="between" radius={0} totalArc={0} fontSize={getResponsiveFontSize(2)} verticalOffset={window.innerWidth <= 480 ? "-0.8em" : "-1.8em"} />
          <BubbleTitle text="1 and 100" radius={0} totalArc={0} fontSize={getResponsiveFontSize(3)} verticalOffset={window.innerWidth <= 480 ? "0.1em" : "0"} />
          <div className="guess-div">
            <input
              type="number"
              value={userGuess}
              onChange={e => setUserGuess(e.target.value)}
              placeholder="Enter your guess"
              disabled={isGameOver}
              onFocus={() => setUserGuess('')}
              onKeyDown={e => {
                if (e.key === 'Enter' && !isGameOver) {
                  handleGuess();
                }
              }}
            />
            <button onClick={handleGuess} disabled={isGameOver}>
              Guess
            </button>
            <button onClick={handleRestart}>
              Restart
            </button>
            <button className="theme-toggle" onClick={handleThemeToggle}>
              {isDarkMode ? '👽' : '🦈'}
            </button>
          </div>
          {isGameOver && correctNumber && (
            <p>The correct number was: {correctNumber}</p>
          )}
          {result === 'correct' && <h2 className="correct-number-txt">You guessed it!</h2>}
          {guesses.length >= maxAttempts && result !== 'correct' && (<h2 className="wrong-number-txt">Game Over</h2>)}
          <p>{result && `Result: ${result}`}</p>
          <div>
            <h3>Your guesses:</h3>
            <ul>
              {guesses.map((guess, idx) => (
                <li key={idx}>{guess}</li>
              ))}
            </ul>
          </div>
        </header>
      </div>
    </div>
  );
}

export default App;
