(function () {
'use strict';

/* ===== Task 1: Higher or Lower (Food House prices) ===== */

// ---- all numbers of the game are constants ----
const MAX_LIVES = 3;      // lives at start
const WIN_STREAK = 10;    // streak needed to win
const LIFE_COST = 1;      // lives lost for a wrong guess
const GUESS_HIGHER = 'higher';
const GUESS_LOWER = 'lower';

const ITEMS = [
  { name: 'Black tea', price: 600 },
  { name: 'Lemonade', price: 900 },
  { name: 'Hummus plate', price: 1500 },
  { name: 'Caesar salad', price: 2200 },
  { name: 'Chicken wrap', price: 2400 },
  { name: 'Beef burger', price: 2900 },
  { name: 'Margherita pizza', price: 3200 },
  { name: 'Pasta carbonara', price: 3400 },
  { name: 'Lamb pilaf (palov)', price: 3800 },
  { name: 'Grilled salmon', price: 5600 },
  { name: 'Ribeye steak', price: 7900 },
  { name: 'Family platter', price: 9500 },
  { name: 'Chocolate cake', price: 1800 },
  { name: 'Iced coffee', price: 1800 } // same price as cake: tests "equal = right"
];

// ---- DOM ----
const elLives = document.getElementById('g-lives');
const elStreak = document.getElementById('g-streak');
const elBest = document.getElementById('g-best');
const elCurrent = document.getElementById('g-current');
const elMessage = document.getElementById('g-message');
const btnHigher = document.getElementById('g-higher');
const btnLower = document.getElementById('g-lower');
const btnRestart = document.getElementById('g-restart');
const gameCard = document.querySelector('#task1 .game-card');

// ---- state ----
let lives;
let streak;
let bestStreak = 0;
let currentIndex;
let gameOver;

// whole number from min to max, both included
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatPrice(value) {
  return value.toLocaleString('en-US') + ' ₸';
}

function pickNextIndex() {
  let index;
  do {
    index = randInt(0, ITEMS.length - 1);
  } while (index === currentIndex);
  return index;
}

function showMessage(text, type) {
  elMessage.textContent = text;
  elMessage.classList.remove('is-success', 'is-error', 'is-warning', 'is-win', 'is-loss');
  if (type) elMessage.classList.add('is-' + type);
}

function render() {
  elLives.textContent = '❤'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
  elStreak.textContent = streak;
  elBest.textContent = bestStreak;
  const item = ITEMS[currentIndex];
  elCurrent.textContent = item.name + ' — ' + formatPrice(item.price);
  btnHigher.disabled = gameOver;
  btnLower.disabled = gameOver;
  gameCard.classList.toggle('is-win', gameOver && lives > 0);
  gameCard.classList.toggle('is-loss', gameOver && lives === 0);
}

function startGame() {
  lives = MAX_LIVES;
  streak = 0;
  gameOver = false;
  currentIndex = randInt(0, ITEMS.length - 1);
  showMessage('Game started. Make your guess!', 'warning');
  render();
}

function makeGuess(guess) {
  // invalid moves are rejected, the state is NOT changed
  if (gameOver) {
    showMessage('The game is over. Press “Restart game” to play again.', 'error');
    return;
  }
  if (guess !== GUESS_HIGHER && guess !== GUESS_LOWER) {
    showMessage('Invalid move. Choose higher or lower.', 'error');
    return;
  }

  const current = ITEMS[currentIndex];
  currentIndex = pickNextIndex();
  const next = ITEMS[currentIndex];

  // equal values count as a right guess
  const isRight =
    (guess === GUESS_HIGHER && next.price >= current.price) ||
    (guess === GUESS_LOWER && next.price <= current.price);

  if (isRight) {
    streak += 1;
    if (streak > bestStreak) bestStreak = streak;
    showMessage('Right! ' + next.name + ' costs ' + formatPrice(next.price) + '.', 'success');
  } else {
    lives -= LIFE_COST;
    streak = 0;
    showMessage('Wrong! ' + next.name + ' costs ' + formatPrice(next.price) + '.', 'error');
  }

  // end of the game: win or loss
  if (streak === WIN_STREAK) {
    gameOver = true;
    showMessage('🏆 You win with a streak of ' + WIN_STREAK + '!', 'win');
  } else if (lives <= 0) {
    gameOver = true;
    showMessage('💀 No lives left. Game over. Best streak: ' + bestStreak + '.', 'loss');
  }

  render();
}

btnHigher.addEventListener('click', () => makeGuess(GUESS_HIGHER));
btnLower.addEventListener('click', () => makeGuess(GUESS_LOWER));
btnRestart.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
  const tag = event.target.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (event.key === 'ArrowUp') { event.preventDefault(); makeGuess(GUESS_HIGHER); }
  if (event.key === 'ArrowDown') { event.preventDefault(); makeGuess(GUESS_LOWER); }
});

startGame();
})();
