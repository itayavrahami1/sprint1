'use strict';

// TODO - expandShown(board, elCell,i, j) - When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 

const MINE = '💣';
const CLEAN = '';
const FLAG = '🏳️‍🌈';

var gBoard;
var gLevel;
var gGame;
var gTimerInterval;
var gStart;
var gMinesLocs;
var gEndOfGame; //Before restart bottun
var gDeltaT;


// TODO - initGame() - function called when page uplaod - intitiate the game and variables
function initGame(level = 'Beginner') {
    gEndOfGame = false;
    document.querySelector('.emoji-figure').innerText = '😊';
    _resetTimer();
    clearInterval(gTimerInterval);
    gLevel = _getGameLevel(level);
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isHint: false
    }
    gBoard = buildBoard();
    renderBoard(gBoard);
    renderHints();//render the hints
    renderLives();//render the lives 
}


// TODO - buildBoard() - Builds the board game (depanding on game's level). Return the created board

function buildBoard() {
    var board = [];
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
                cellClass += 'Mine';
                cellContent = MINE; // if isMine the cell content is mine
            } else if (cell.minesAroundCount === 0) {
                cellContent = CLEAN;
            } else {
                cellClass += 'safe'; // MAYBE CHANGE THE CELL-CLASS DEF LATER
                cellContent = cell.minesAroundCount; // if NOT isMine the cell content is the number of Negs that are mines
            }
            htmlStr += `<td id="cell-${i}-${j}" class="${cellClass}" onclick="cellClicked(this, ${i}, ${j})" onmousedown="cellMarked(this,event, ${i}, ${j})">
                        <span class="span-${i}-${j}">${cellContent}</span></td>`; //new cell + cell class + onclick option + right click action + span with i,j for inner text use;
        }
        htmlStr += '</tr>';
    }
    var elTable = document.querySelector('.mine-sweeper-cells');
    elTable.innerHTML = htmlStr;

    // rendering the initial number of mines according to the level 
    var elMineCounter = document.querySelector('.game-features');
    var elCounter = elMineCounter.querySelector('.mine-counter');
    elCounter.querySelector('span').innerText = gLevel.MINES;
}

function getMinesNegsCount(board, posI, posJ) { // MAYBE CHANGE THE ROWIDX,COLIDX  FOR BETTER NAMES - INSPECTCELLROWIDX or somthing like that
    var numOfNegsMines = 0;
    var currNeg;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i > (board.length - 1)) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if ((i === posI && j === posJ) || j < 0 || j > (board[0].length - 1)) continue;
            currNeg = board[i][j];
            if (currNeg.isMine) numOfNegsMines++;
        }

    }
    return numOfNegsMines;
}

// TODO - cellClicked(elCell, i, j) - support selecting cell (td).
function cellClicked(elCell, i, j) {
    // gGame.secsPassed = gDeltaT; //updating secPassed from the gDeltaT var in the setIntevarl() function
    // console.log(gGame.secsPassed);
    // console.log(gDeltaT);
    // debugger
    // if (gGame.secsPassed && !gGame.isOn) return; // NEED TO CHECK WHY gGame.secsPassed DONT UPDATE FROM _NYTIMER(). THEN SAVE THE gEndOfGame variable. for the end of the game - only after restrat can continue play. 
                                    //dont use gGame.isOn because in the first click it (gGame.isOn) false and the need to init the game from this
                                    // function (cell clicke and then re-render the board - first click coudlwt be a mine)
    if (gEndOfGame) return;
    var cell = gBoard[i][j];
    if (cell.isMarked) return; // return if the cell is marked with flag

    // if the click is first clicked. game on - true and starts timer. 
    if (!gGame.isOn) {
        var firstClick = true;
        var currMineCoord;
        gGame.isOn = !gGame.isOn;
        // setting timer
        gStart = Date.now();
        setTimer(gStart);
        // placing mines
        gMinesLocs = getMinesLoc(i, j);
        for (var idx = 0; idx < gMinesLocs.length; idx++) {
            currMineCoord = gMinesLocs[idx];
            gBoard[currMineCoord.i][currMineCoord.j].isMine = true;
        }
        setMinesNegsCount(gBoard); //updating the cell minesAroundCount on the board
        renderBoard(gBoard);
    }

    
    // if clicked with hint -ADD CHANGE IMAGE AND OPTION TO ON\OFF HINT. JUST AFTER HINT USED - HIDDEN
    if (gGame.isHint && gLevel.HINTS){
        _showCells(i,j);
        gLevel.HINTS--;
        return
    }

    // if clicked on mine - do this..
    // TODO - support lives option
    if (cell.isMine) {
        //TODO - reveal all mines
        gGame.isOn = false;
        checkEndGame();
        return;
    }

    cell.isShown = true; // changing cell property to shown
    if (cell.isShown) gGame.shownCount++; // if a cell is shown count up
    // if the cell num of Negs is 0 - do..
    if (cell.minesAroundCount === 0) {
        _turnCellToShown(gBoard, i, j);
        _revealShown(gBoard);
    }

    // re-selecting the cell because of the board re-rendering in the first click (to assure no mine is clicked in first click)
    if (firstClick) {
        var elCell = document.querySelector('#cell-' + i + '-' + j);
        firstClick = false;
    }

    elCell.classList.add('clicked');
    var elCellSpan = elCell.querySelector('span');
    elCellSpan.style.visibility = 'visible';

    checkEndGame();

}

function getMinesLoc(firstCEllI, firstCellJ) {
    var nums = []; // number of cells of the board from 1 - index i=0,j=0 - to (board SIZE)^2 - i=SIZE-1,j=SIZE-1 - number 3 is i=0,j=2, for example
    var coord = { i: 0, j: 0 };
    var idx;
    var numOnBoard;
    var minesLoc = [];
    for (var i = 0; i < (gLevel.SIZE ** 2); i++) {
        nums.push(i);
    }

    // splicing out the first clicked cell 
    nums.splice((firstCEllI * gLevel.SIZE + firstCellJ), 1);

    for (var i = 0; i < gLevel.MINES; i++) {
        idx = _getRandomIntInclusive(0, nums.length);
        numOnBoard = nums.splice(idx, 1);
        coord = { i: Math.floor(numOnBoard / gLevel.SIZE), j: (numOnBoard % gLevel.SIZE) }
        minesLoc.push(coord)
    }

    return minesLoc;
}


// TODO - cellMarked(elCell) - When cell is marked
function cellMarked(elCell, event, i, j) {
    // gGame.secsPassed = gDeltaT; //updating secPassed from the gDeltaT var in the setIntevarl() function
    // if (gGame.secsPassed && !gGame.isOn) return;
    // debugger
    if (gEndOfGame) return;
    if (event.button === 0) return;
    if (!gGame.isOn) return;
    var elSpan = elCell.querySelector('span');
    var cell = gBoard[i][j];
    // if numOfFlags larger that numOfMines cant mark
    if (!cell.isMarked && ((gGame.markedCount + 1) > gLevel.MINES)) return;
    // debugger
    if (!cell.isMarked) { // marked and numOfFlags smaller than numOfMines will put a flag
        elSpan.innerText = FLAG;
        elSpan.classList.add('marked');//add and remove marked class - visibility
        cell.isMarked = !cell.isMarked;
        gGame.markedCount++;
    } else if (cell.isMarked) { // if the cell is marked - with flag - and the number of flags is equal to the number of mines, take off the flag
        elSpan.innerText = cell.minesAroundCount;
        elSpan.classList.remove('marked');//add and remove marked class - visibility
        cell.isMarked = !cell.isMarked;
        gGame.markedCount--;
    }

    // updating the mines counter
    var elMineCounter = document.querySelector('.game-features');
    var elCounter = elMineCounter.querySelector('.mine-counter');
    elCounter.querySelector('span').innerText = (gLevel.MINES - gGame.markedCount);
    checkEndGame();
}
// TODO - checkGameOver() - check if the game is still on
function checkEndGame() {
    if (gGame.isOn) {
        if ((gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2)) {
            clearInterval(gTimerInterval);
            gGame.isOn = false;
            gEndOfGame = true;
            document.querySelector('.emoji-figure').innerText = '😎';
            document.querySelector('h2 span').innerText = '👏👏 Congrats! You Won! 👏👏';
        }
    } else {
        _revealMines();
        clearInterval(gTimerInterval);
        document.querySelector('h2 span').innerText = 'You Loose! Try Again!';
        // gGame.isOn = false;
        gEndOfGame = true;
        document.querySelector('.emoji-figure').innerText = '🤯';
        // checks if all the flages are indeed mines and place X if the flag was wrong
        var markedNotMinesArr = _getMarkedMines();
        for (var i = 0; i < markedNotMinesArr.length; i++) {
            var negClassStr = '.span-' + markedNotMinesArr[i].i + '-' + markedNotMinesArr[i].j;
            var elSpan = document.querySelector(negClassStr);
            elSpan.innerText = '❌';
        }
    }
}