'use strict';

// var gBoard = {
//   minesAroundCount: 4,
//   isShown: true,
//   isMine: false,
//   isMarked: true,
// };

const MINE = '💣';
const EMPTY = ' ';
const FLAG = '🚩';
const LIFE = '🤍';
const ALIVE = '😁';
const DEAD = '👻';
const WON = '😎';
const STEPPED = '🤯';
const HINT = '💡';

var gBoard;
var gMines = [];
var gLevel = {};
var gGame = {};
var gTimer;
var gMarked;
var gHighScore = [];
// var gLocalStorage = window.localStorage;
// document.getElementsByClassName('cell').onmousedown = cellClicked;
document.addEventListener('mousedown', cellClicked);
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

function initGame(size = 4, mines = 2) {
  console.log('STARTING GAME');
  gLevel = { SIZE: size, MINES: mines };
  gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: gLevel.SIZE === 4 ? 1 : 3,
    hints: 3,
    isHintMode: false,
  };
  getHighScore();
  gMines = [];
  gMarked = 0;
  clearInterval(gTimer);
  gBoard = buildBoard();
  setMinesNegsCount(gBoard);
  gTimer = setInterval(timer, 1000);
  renderBoard(gBoard, '.game-board');
  renderLives();
  renderHints();
  renderStatus();
  renderMinesMarked();
}

function timer() {
  if (!gGame.isOn) return;
  if (gGame.secsPassed > 999) return;
  // console.log('TIMER');
  var elTimer = document.querySelector('.timer');
  gGame.secsPassed += 1;
  var secondsStr = '' + gGame.secsPassed;
  elTimer.innerText = secondsStr.padStart(3, '0');
}

function buildBoard() {
  console.log('BUILDING BOARD');

  var board = [];

  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        gameELement: EMPTY,
      };
    }
  }

  //   for (var i = 0; i < gLevel.MINES; i++) {
  while (gMines.length < gLevel.MINES) {
    //   while (counter < 8) {
    var location = getRandomLocation(gLevel.SIZE);
    // console.log('Location Random', location);

    var locationIsAvailable = gMines.find(
      (loc) => loc.i === location.i && loc.j === location.j
    );
    // console.log(locationIsAvailable);
    if (!locationIsAvailable) {
      gMines.push(location);
      // if (!gBoard[location.i][location.j].isMine)
      //   gBoard[location.i][location.j].isMine = true;
    }
  }

  for (var i = 0; i < gMines.length; i++) {
    // var iIdx = gMinesLocations[i].i;
    // console.log(gBoard[iIdx]);
    // console.log(board[gMinesLocations[i].i][gMinesLocations[i].j]);
    board[gMines[i].i][gMines[i].j].isMine = true;
    board[gMines[i].i][gMines[i].j].gameELement = MINE;
  }

  //   console.log(gMinesLocations);
  console.table(board);
  return board;
}

function renderBoard(board, selector) {
  console.log('RENDERING BOARD');
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += `<tr>`;
    for (var j = 0; j < board[0].length; j++) {
      var className = `cell cell-${i}-${j}`;
      //   strHTML += `<td class="${className}" oncontextmenu="markCell(this);" onclick="cellClicked(this)">${
      //     board[i][j].isMine && board[i][j].isShown ? MINE : EMPTY
      //   }</td>`;
      //   strHTML += `<td class="${className}"onclick="cellClicked(this)">${
      //     board[i][j].isMine && board[i][j].isShown ? MINE : EMPTY
      //   }</td>`;
      strHTML += `<td class="${className}">${
        board[i][j].isMine && board[i][j].isShown ? MINE : EMPTY
      }</td>`;
    }
    strHTML += '</tr>';
  }
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function setMinesNegsCount(board) {
  console.log('CONTING MINES');
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currCell = board[i][j];
      //   console.log('current cell', currCell);
      if (currCell.isMine) continue;
      currCell.minesAroundCount = countMinesAroundCell(board, i, j);
      // var numMinesAround = countMinesAroundCell(board, i, j);
      // currCell.minesAroundCount = NUMBERS[numMinesAround];
      gBoard[i][j].gameELement = currCell.minesAroundCount;
    }
  }
  //   console.table(board);
}

function countMinesAroundCell(board, iIdx, jIdx) {
  //   console.log(`cell[${iIdx}][${jIdx}]: ${board[iIdx][jIdx].isMine}`);
  var minesCounter = 0;
  for (var i = iIdx - 1; i <= iIdx + 1; i++) {
    // console.log('i = ', i);
    if (i === -1 || i === board.length) continue;
    for (var j = jIdx - 1; j <= jIdx + 1; j++) {
      if (j === -1 || j === board.length) continue;
      //   console.log('j = ', j);
      if (board[i][j].isMine) minesCounter++;
    }
  }
  return minesCounter;
}

function cellClicked(elCell) {
  if (!gGame.isOn) return;
  if (elCell.target.classList[0] !== 'cell') return;

  console.log('CELL CLICKED');

  var cellClassName = elCell.target.classList[1].split('-');
  console.log('class name array', cellClassName);
  //   console.log(cellClassName);
  var location = {
    i: +cellClassName[cellClassName.length - 2],
    j: +cellClassName[cellClassName.length - 1],
  };
  console.log('location', location);
  if (elCell.button === 2) {
    markCell(elCell.target, location);
    return;
  }
  if (elCell.button === 0) {
    showCell(elCell.target, location);
    return;
  }
  //   console.dir(elCell);
  //   console.dir(elCell.target.className);

  //   console.log(location);
  //   console.log(gBoard[location.i][location.j].isMine);
}

function showCell(elCell, location) {
  console.log('SHOW CELL');
  if (gBoard[location.i][location.j].isShown) return;
  console.log('location', location);

  if (gGame.isHintMode && !gBoard[location.i][location.j].isShown) {
    hint(elCell, location);
    return;
  }

  // console.table(gBoard);
  if (gBoard[location.i][location.j].isMine && gGame.lives === 1) {
    lostGame();
    return;
  } else if (gBoard[location.i][location.j].isMine) {
    gGame.lives--;

    // console.log('mines', gMines);
    // var mineRevealed = gMines.findIndex(
    //   (mine) => mine.i === location.i && mine.j === location.j
    // );
    // console.log('mine revealed', mineRevealed);
    renderStatus(STEPPED);
    setTimeout(renderStatus, 1000);
    renderLives();
    gBoard[location.i][location.j].isShown = true;
    elCell.innerText = MINE;
  }

  // console.log(
  //   'mines near tile',
  //   gBoard[location.i][location.j].minesAroundCount
  // );

  if (gBoard[location.i][location.j].minesAroundCount === 0) {
    expandNeighbours(location);
    return;
  }
  // console.log('NOT 0');
  gBoard[location.i][location.j].isShown = true;
  elCell.innerText = gBoard[location.i][location.j].minesAroundCount;

  checkWon();
}

function expandNeighbours({ i, j }) {
  console.log('ZERO POOL');

  var elCell = document.querySelector(`.cell-${i}-${j}`);
  if (i < 0 || i > gLevel.SIZE - 1 || j < 0 || j > gLevel.SIZE - 1) return;

  if (!gBoard[i][j].isShown) {
    gBoard[i][j].isShown = true;
    elCell.innerText = gBoard[i][j].minesAroundCount
      ? gBoard[i][j].minesAroundCount
      : ' ';
    if (!gBoard[i][j].minesAroundCount) elCell.classList.add('clicked-cell');
    if (gBoard[i][j].minesAroundCount) return;

    expandNeighbours({ i: i + 1, j: j });
    expandNeighbours({ i: i - 1, j: j });
    expandNeighbours({ i: i, j: j + 1 });
    expandNeighbours({ i: i, j: j - 1 });
  } else return;
}

function askHint() {
  console.log('HINT MODE ACTIVATED');
  // gGame.hints--;
  // renderHints();
  if (gGame.isHintMode) return;
  gGame.isHintMode = true;
}

function hint(elCell, location) {
  // REFACTOR FUNCTION
  console.log('ASKED FOR HINT');
  console.log('cell', elCell);
  gGame.hints--;
  renderHints();
  console.log(location);
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      console.log('i,j', i, j);
      if (i === -1 || i === gLevel.SIZE || j === -1 || j === gLevel.SIZE)
        continue;
      if (gBoard[i][j].isMarked || gBoard[i][j].isShown) continue;

      var currCell = document.querySelector(`.cell-${i}-${j}`);
      console.log(currCell);
      currCell.innerText = gBoard[i][j].gameELement;
    }
  }

  setTimeout(function () {
    console.log('STOP HINT MODE');
    gGame.isHintMode = false;
    for (var i = location.i - 1; i <= location.i + 1; i++) {
      for (var j = location.j - 1; j <= location.j + 1; j++) {
        if (i === -1 || i === gLevel.SIZE || j === -1 || j === gLevel.SIZE)
          continue;

        if (gBoard[i][j].isMarked || gBoard[i][j].isShown) continue;

        var currCell = document.querySelector(`.cell-${i}-${j}`);
        console.log(currCell);
        currCell.innerText = ' ';
      }
    }
  }, 1000);
}

function renderLives() {
  var elLives = document.querySelector('.lives-bar');
  elLives.innerText = LIFE.repeat(gGame.lives);
}

function renderStatus(face = ALIVE) {
  var elLives = document.querySelector('.status');
  elLives.innerText = face;
}

function renderHints() {
  var elHints = document.querySelector('.hints');
  var strHTML = '<table><tbody><tr>';
  for (var i = 0; i < gGame.hints; i++) {
    strHTML += `<td class="hint" onclick=askHint()>${HINT}</td>\n`;
  }
  strHTML += '</table></tbody></tr>';
  elHints.innerHTML = strHTML;
}

function renderMinesMarked() {
  console.log('MARKED MINES LABEL');
  var elLives = document.querySelector('.mines-left');
  elLives.innerText = gLevel.MINES - gMarked > 0 ? gLevel.MINES - gMarked : 0;
}

function lostGame() {
  console.log('GAME LOST');
  renderStatus(DEAD);
  for (var i = 0; i < gMines.length; i++) {
    var location = gMines[i];
    // console.log(location);
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerText = MINE;
  }
  gGame.isOn = false;
}

function markCell(elCell, location) {
  console.log('MARK CELL');
  if (gBoard[location.i][location.j].isShown) return;
  var gameELement = !gBoard[location.i][location.j].isMarked ? FLAG : EMPTY;

  gBoard[location.i][location.j].isMarked =
    !gBoard[location.i][location.j].isMarked;
  elCell.innerText = gameELement;
  gMarked++;
  renderMinesMarked();
  checkWon();
}

function checkWon() {
  console.log('CHECKING IF WON');
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currCell = gBoard[i][j];
      // console.log(currCell);

      if (!currCell.isShown && !currCell.isMine) return;

      if (!currCell.isShown && currCell.isMine && !currCell.isMarked) return;
    }
  }
  console.log('YOU WON');
  renderStatus(WON);
  gGame.isOn = false;
  gTimer = null;

  checkHighScore();
}

function checkHighScore() {
  console.log('CHECKING FOR HIGH SCORE');
  var id = localStorage.length + 1;
  console.log(gHighScore[gHighScore.length - 1]);

  if (
    gHighScore.length < 3 ||
    gHighScore[gHighScore.length - 1].time > gGame.secsPassed
  ) {
    console.log('NEW RECORD');
    var name = prompt(`NEW RECORD!! enter your name!`);
    var newRecord = { time: gGame.secsPassed, level: gLevel.MINES, name: name };
    gHighScore.push(newRecord);
    localStorage.setItem('' + id, JSON.stringify(newRecord));
  }
  gHighScore.sort(compareTimes);
}
function getHighScore() {
  gHighScore = [];
  console.log('GETTING HIGH SCORES');
  var length = localStorage.length;
  console.log(length);

  if (!length) return;

  console.log(localStorage);
  console.log(gHighScore);

  for (var i = 0; i < length; i++) {
    console.log(localStorage.getItem(localStorage.key(i)));
    var record = JSON.parse(localStorage.getItem(localStorage.key(i)));
    console.log(record);
    if (record.level === gLevel.MINES) gHighScore.push(record);
  }
  gHighScore.sort(compareTimes);
  console.log(gHighScore);
}

function compareTimes(a, b) {
  return a.time - b.time;
}

function changeLevel(level) {
  console.log('CHANGING LEVEL');
  console.log('level', level);

  var size = 0;
  var mines = 0;
  switch (level) {
    case 'easy':
      size = 4;
      mines = 2;
      break;
    case 'medium':
      size = 8;
      mines = 12;
      break;
    case 'hard':
      size = 12;
      mines = 30;
      break;
  }
  initGame(size, mines);
}

function renderHighScores() {
  console.log(gHighScore);
  console.log('RENDERING HIGH SCORES');
  var strHTML =
    '<table class="score-table"><tr><th>Name</th><th>Score</th></tr>';

  for (var i = 0; i < gHighScore.length && i < 3; i++) {
    strHTML += `<tr><td>${gHighScore[i].name}</td><td>${gHighScore[i].time}</td></tr>`;
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector('.modal-high-score');
  elContainer.innerHTML = strHTML;
}
