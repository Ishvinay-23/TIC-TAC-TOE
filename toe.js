const board = document.getElementById("board");
const statusText = document.getElementById("status");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const difficultySelect = document.getElementById("difficulty");

let currentPlayer = "X";
let gameOver = false;
let boardState = ["", "", "", "", "", "", "", "", ""];
let score = { X: 0, O: 0 };
let vsAI = true;

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function drawBoard() {
  board.innerHTML = "";
  boardState.forEach((cell, idx) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.textContent = cell;
    div.addEventListener("click", () => handleClick(idx));
    board.appendChild(div);
  });
}

function handleClick(index) {
  if (boardState[index] || gameOver) return;
  boardState[index] = currentPlayer;
  playSound("tapSound");
  drawBoard();

  if (checkWinner(currentPlayer)) {
    statusText.textContent = getPlayerName(currentPlayer) + " wins!";
    playSound("winSound");
    score[currentPlayer]++;
    updateScore();
    gameOver = true;
    setTimeout(newGame, 1500);
    return;
  }

  if (boardState.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    playSound("drawSound");
    gameOver = true;
    setTimeout(newGame, 1500);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (vsAI && currentPlayer === "O") {
    setTimeout(makeAIMove, 500);
  }
}

function getPlayerName(symbol) {
  if (symbol === "X") return player1Input.value || "Player 1";
  return vsAI ? "AI" : (player2Input.value || "Player 2");
}

function updateScore() {
  document.getElementById("p1Score").textContent = score.X;
  document.getElementById("p2Score").textContent = score.O;
}

function resetGame() {
  score = { X: 0, O: 0 };
  updateScore();
  newGame();
}

function checkWinner(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  const win = winPatterns.find(pattern =>
    pattern.every(idx => boardState[idx] === player)
  );
  if (win) {
    win.forEach(idx => board.children[idx].classList.add("win"));
    return true;
  }
  return false;
}

function makeAIMove() {
  let move;
  if (difficultySelect.value === "easy") {
    let empty = boardState.map((val, idx) => val === "" ? idx : null).filter(x => x !== null);
    move = empty[Math.floor(Math.random() * empty.length)];
  } else {
    move = getBestMove();
  }
  boardState[move] = "O";
  playSound("tapSound");
  drawBoard();
  if (checkWinner("O")) {
    statusText.textContent = "AI wins!";
    playSound("winSound");
    score.O++;
    updateScore();
    gameOver = true;
    setTimeout(newGame, 1500);
    return;
  }
  if (boardState.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    playSound("drawSound");
    gameOver = true;
    setTimeout(newGame, 1500);
    return;
  }
  currentPlayer = "X";
}

function getBestMove() {
  const minimax = (board, depth, isMax) => {
    if (checkWinner("O")) return 10 - depth;
    if (checkWinner("X")) return depth - 10;
    if (board.every(cell => cell !== "")) return 0;

    if (isMax) {
      let best = -Infinity;
      board.forEach((cell, idx) => {
        if (cell === "") {
          board[idx] = "O";
          best = Math.max(best, minimax(board, depth + 1, false));
          board[idx] = "";
        }
      });
      return best;
    } else {
      let best = Infinity;
      board.forEach((cell, idx) => {
        if (cell === "") {
          board[idx] = "X";
          best = Math.min(best, minimax(board, depth + 1, true));
          board[idx] = "";
        }
      });
      return best;
    }
  };

  let bestScore = -Infinity;
  let bestMove;
  boardState.forEach((cell, idx) => {
    if (cell === "") {
      boardState[idx] = "O";
      let score = minimax(boardState, 0, false);
      boardState[idx] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }
  });
  return bestMove;
}

function newGame() {
  boardState = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameOver = false;
  statusText.textContent = "";
  vsAI = !player2Input.value; // If no player 2 name, play vs AI
  drawBoard();
}

drawBoard();
