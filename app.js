function shuffle(src) {
  const copy = [...src];

  const length = copy.length;
  for (let i = 0; i < length; i++) {
    const x = copy[i];
    const y = Math.floor(Math.random() * length);
    const z = copy[y];
    copy[i] = z;
    copy[y] = x;
  }

  if (typeof src === "string") {
    return copy.join("");
  }

  return copy;
}

const { useState, useEffect } = React;

function App() {
  const MAX_STRIKES = 5;
  const MAX_PASSES = 3;

  const wordList = [
    "react",
    "button",
    "screen",
    "coding",
    "array",
    "state",
    "mouse",
    "guess",
    "logic",
    "input"
  ];

  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [guess, setGuess] = useState("");
  const [points, setPoints] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [passes, setPasses] = useState(MAX_PASSES);
  const [message, setMessage] = useState("Start guessing!");
  const [messageType, setMessageType] = useState("normal");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const savedWords = localStorage.getItem("words");
    const savedCurrentWord = localStorage.getItem("currentWord");
    const savedScrambledWord = localStorage.getItem("scrambledWord");
    const savedPoints = localStorage.getItem("points");
    const savedStrikes = localStorage.getItem("strikes");
    const savedPasses = localStorage.getItem("passes");
    const savedMessage = localStorage.getItem("message");
    const savedMessageType = localStorage.getItem("messageType");
    const savedGameOver = localStorage.getItem("gameOver");

    if (
      savedWords !== null &&
      savedCurrentWord !== null &&
      savedScrambledWord !== null &&
      savedPoints !== null &&
      savedStrikes !== null &&
      savedPasses !== null &&
      savedMessage !== null &&
      savedMessageType !== null &&
      savedGameOver !== null
    ) {
      setWords(JSON.parse(savedWords));
      setCurrentWord(savedCurrentWord);
      setScrambledWord(savedScrambledWord);
      setPoints(Number(savedPoints));
      setStrikes(Number(savedStrikes));
      setPasses(Number(savedPasses));
      setMessage(savedMessage);
      setMessageType(savedMessageType);
      setGameOver(savedGameOver === "true");
    } else {
      startGame();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words));
    localStorage.setItem("currentWord", currentWord);
    localStorage.setItem("scrambledWord", scrambledWord);
    localStorage.setItem("points", points);
    localStorage.setItem("strikes", strikes);
    localStorage.setItem("passes", passes);
    localStorage.setItem("message", message);
    localStorage.setItem("messageType", messageType);
    localStorage.setItem("gameOver", gameOver);
  }, [
    words,
    currentWord,
    scrambledWord,
    points,
    strikes,
    passes,
    message,
    messageType,
    gameOver
  ]);

  function getMixedWord(word) {
    let mixedWord = shuffle(word);

    while (mixedWord === word) {
      mixedWord = shuffle(word);
    }

    return mixedWord;
  }

  function startGame() {
    const newWords = shuffle(wordList);
    const firstWord = newWords[0];

    setWords(newWords);
    setCurrentWord(firstWord);
    setScrambledWord(getMixedWord(firstWord));
    setGuess("");
    setPoints(0);
    setStrikes(0);
    setPasses(MAX_PASSES);
    setMessage("Start guessing!");
    setMessageType("normal");
    setGameOver(false);
  }

  function showNextWord(newWords) {
    if (newWords.length === 0) {
      setGameOver(true);
      setCurrentWord("");
      setScrambledWord("");
      setMessage("You finished all the words!");
      setMessageType("correct");
      return;
    }

    const nextWord = newWords[0];
    setCurrentWord(nextWord);
    setScrambledWord(getMixedWord(nextWord));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (gameOver) {
      return;
    }

    if (guess.trim() === "") {
      setMessage("Please type a guess.");
      setMessageType("normal");
      return;
    }

    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      const newWords = words.slice(1);

      setPoints(points + 1);
      setWords(newWords);
      setMessage("Correct. Next word.");
      setMessageType("correct");
      showNextWord(newWords);
    } else {
      const newStrikes = strikes + 1;

      setStrikes(newStrikes);
      setMessage("Incorrect. Try again.");
      setMessageType("incorrect");

      if (newStrikes >= MAX_STRIKES) {
        setGameOver(true);
        setMessage("Game over. Too many strikes.");
        setMessageType("incorrect");
      }
    }

    setGuess("");
  }

  function handlePass() {
    if (gameOver) {
      return;
    }

    if (passes === 0) {
      setMessage("No passes remaining.");
      setMessageType("incorrect");
      return;
    }

    const newWords = words.slice(1);

    setPasses(passes - 1);
    setWords(newWords);
    setGuess("");
    setMessage("You passed. Next word.");
    setMessageType("normal");
    showNextWord(newWords);
  }

  function resetGame() {
    localStorage.removeItem("words");
    localStorage.removeItem("currentWord");
    localStorage.removeItem("scrambledWord");
    localStorage.removeItem("points");
    localStorage.removeItem("strikes");
    localStorage.removeItem("passes");
    localStorage.removeItem("message");
    localStorage.removeItem("messageType");
    localStorage.removeItem("gameOver");

    startGame();
  }

  return (
    <div className="game-box">
      <h1>Welcome to Scramble.</h1>

      {!gameOver && (
        <>
          <div className="score-row">
            <div className="score-box">
              <div className="score-number">{points}</div>
              <div className="score-label">Points</div>
            </div>

            <div className="score-box right">
              <div className="score-number">{strikes}</div>
              <div className="score-label">Strikes</div>
            </div>
          </div>

          <div className={"message " + messageType}>
            {message}
          </div>

          <div className="scrambled-word">{scrambledWord}</div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
            />
            <button type="submit" className="hidden-button">Guess</button>
          </form>

          <button
            onClick={handlePass}
            disabled={passes === 0}
            className="pass-button"
          >
            {passes} Passes Remaining
          </button>
        </>
      )}

      {gameOver && (
        <div className="game-over-box">
          <h2>Game Over</h2>
          <p>Points: {points}</p>
          <p>Strikes: {strikes}</p>
          <button onClick={resetGame} className="play-again-button">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);