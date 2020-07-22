'use strict';






// TODO - checkGameOver() - check if the game is still on
// TODO - expandShown(board, elCell,i, j) - When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 

const MINE = '@';
const SAFE = '';
var gBoard;
var gLevel;
var gGame;
var gTimerInterval;
var minesCounter;


// TODO - initGame() - function called when page uplaod - intitiate the game and variables
function initGame(level = 'Beginner') {
    gLevel = getGameLevel(level);
    minesCounter = gLevel.MINES; // for mines counter use
    gBoard = buildBoard();
    renderBoard(gBoard)


}


// TODO - buildBoard() - Builds the board game (depanding on game's level).
//                       Set mines at random locations Call SETMINESNEGSCOUNT(). Return the created board

function buildBoard() {
    var board = [];
    var minesLoc = getMinesLoc();
    var currMineCoord; //declaring here use later when placing mines - after building the board
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    // placing mines
    for (var i = 0; i < minesLoc.length; i++) {
        currMineCoord = minesLoc[i];
        board[currMineCoord.i][currMineCoord.j].isMine = true;
    }
    setMinesNegsCount(board); //updating the cell minesAroundCount on the board
    return board;

}

// TODO - setMinesNegsCount(board) - Count mines around each cell. and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    // var numOfNegs = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var cellMinesNegs = getMinesNegsCount(board, i, j); //for each cell count the negs that are mines
            cell.minesAroundCount = cellMinesNegs;
        }
    }
}

// TODO - renderBoard(board) - render the board
function renderBoard(board) {
    var htmlStr = '';
    for (var i = 0; i < board.length; i++) {
        htmlStr += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var cellContent = '';

            var cellClass = '';
            if (cell.isMine) {
                cellClass += ' Mine';
                cellContent = MINE; // if isMine the cell content is mine
            }
            else {
                cellClass += ' safe'; // MAYBE CHANGE THE CELL-CLASS DEF LATER
                cellContent = cell.minesAroundCount; // if NOT isMine the cell content is the number of Negs that are mines
            }
            htmlStr += `<td class="${cellClass}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="event.preventDefault()"><span>${cellContent}</span></td>`;
        }
        htmlStr += '</tr>';
    }
    var elTable = document.querySelector('.mine-sweeper-cells');
    elTable.innerHTML = htmlStr;

    // rendering the initial number of mines according to the level 
    var elMineCounter = document.querySelector('.game-features');
    var elCounter = elMineCounter.querySelector('.mine-counter');
    elCounter.querySelector('span').innerText = minesCounter--;


}

function getMinesNegsCount(board, rowIdx, colIdx) { // MAYBE CHANGE THE ROWIDX,COLIDX  FOR BETTER NAMES - INSPECTCELLROWIDX or somthing like that
    var numOfNegsMines = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > (board.length - 1)) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if ((i === rowIdx && j === colIdx) || j < 0 || j > (board[0].length - 1)) continue;
            var currNeg = board[i][j];
            if (currNeg.isMine) numOfNegsMines++;
        }

    }
    return numOfNegsMines;
}

// TODO - cellClicked(elCell, i, j) - support selecting cell (td).
function cellClicked(elCell, i, j) {
    var buttonsPressed = instanceOfMouseEvent.which;
    console.log(buttonsPressed);

    // check which mouse btn clicked
    // var mouseBtn = _getMouseBtn(elCell);
    // var mouseBtn = e.buttons;
    // console.log(mouseBtn);

    var cell = gBoard[i][j];
    cell.isShown = true;
    if (cell.isMine) {
        var elMineCounter = document.querySelector('.game-features');
        var elCounter = elMineCounter.querySelector('.mine-counter');
        elCounter.querySelector('span').innerText = minesCounter--;
        // return;
    }
    var elCellSpan = elCell.querySelector('span');
    elCellSpan.style.visibility = 'visible';
}

function getMinesLoc() {
    var nums = []; // number of cells of the board from 1 - index i=0,j=0 - to (board SIZE)^2 - i=SIZE-1,j=SIZE-1 - number 3 is i=0,j=2, for example
    var coord = { i: 0, j: 0 };
    var idx;
    var numOnBoard;
    var minesLoc = [];
    for (var i = 0; i < (gLevel.SIZE ** 2); i++) {
        nums.push(i);
    }

    for (var i = 0; i < gLevel.MINES; i++) {
        idx = _getRandomIntInclusive(0, nums.length);
        numOnBoard = nums.splice(idx, 1);
        coord = { i: Math.floor(numOnBoard / gLevel.SIZE), j: (numOnBoard % gLevel.SIZE) }
        minesLoc.push(coord)
    }

    return minesLoc;
}

function getGameLevel(level) {
    gLevel = {
        SIZE: 4,
        MINES: 2
    }

    if (level === 'Beginner') return gLevel;

    switch (level) {
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
        default: break
    }

    return gLevel;
}

// TODO - cellMarked(elCell) - When cell is marked



