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
var gShownCellCounter;
var gEndOfGame;


// TODO - initGame() - function called when page uplaod - intitiate the game and variables
function initGame(level = 'Beginner') {
    gEndOfGame = false;
    // gFlagedLocs = [];
    _resetTimet();
    gShownCellCounter = 0
    clearInterval(gTimerInterval);
    gLevel = _getGameLevel(level);
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard();
    renderBoard(gBoard)

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

    // if clicked on mine - do this..
    if (cell.isMine) {
        //TODO - reveal all mines
        gGame.isOn = false;
        checkEndGame();
        return;
    }

    cell.isShown = true; // changing cell property to shown
    if (cell.isShown) gShownCellCounter++; // if a cell is shown count up
    // if the cell num of Negs is 0 - do..
    if (cell.minesAroundCount === 0) {
        var negs = _getNegsCoords(gBoard, i, j);
        revealNegs(gBoard, negs); // function that reveals the negs of a cell with minesAroundCount = 0
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
    if (gEndOfGame) return;
    if (event.button === 0) return;
    if (!gGame.isOn) return;
    var elSpan = elCell.querySelector('span');
    var cell = gBoard[i][j];
    var revealContent; // if true -  reveals the cell content

    console.log('markCount', (gGame.markedCount + 1));
    // if numOfFlags larger that numOfMines cant mark
    if (!((gGame.markedCount + 1) > gLevel.MINES)) {
        cell.isMarked = !cell.isMarked;
    }
    
    if (cell.isMarked && ((gGame.markedCount) < gLevel.MINES)) { // marked and numOfFlags smaller than numOfMines
        console.log('from if', cell.isMarked);
        elSpan.innerText = FLAG;
        elSpan.classList.add('marked');//add and remove marked class - visibility
        gGame.markedCount++;
    } else if (!((gGame.markedCount + 1) > gLevel.MINES)) { // MAYBE Unnecessary
        console.log('from first else if', cell.isMarked);
        elSpan.innerText = cell.minesAroundCount;
        elSpan.classList.remove('marked');//add and remove marked class - visibility
        gGame.markedCount--;
    } else if (cell.isMarked && ((gGame.markedCount + 1) > gLevel.MINES)){ // taking of the flag if numOfFlags equal numOfMines
        console.log('from second else if', cell.isMarked);
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

function revealNegs(board, negs) {
    var negCoord;
    var elSpan;
    var elCell;
    for (var idx = 0; idx < negs.length; idx++) {
        negCoord = negs[idx];
        var negCell = board[negCoord.i][negCoord.j];
        if (negCell.isShown || negCell.isMarked) continue;
        negCell.isShown = true; // changing the js cell propery to shown 
        var negClassStr = '.span-' + negCoord.i + '-' + negCoord.j;
        var cellIdStr = '#cell-' + negCoord.i + '-' + negCoord.j;
        elSpan = document.querySelector(negClassStr); // for inner text use
        elCell = document.querySelector(cellIdStr); // for clickeng the cell
        elCell.classList.add('clicked'); // clicking the cell
        elSpan.style.visibility = 'visible'; // renders the cell to visible
        gShownCellCounter++;
    }
}

// TODO - checkGameOver() - check if the game is still on
function checkEndGame() {
    if (gGame.isOn) {
        if ((gShownCellCounter + gGame.markedCount === gLevel.SIZE ** 2)) {
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




