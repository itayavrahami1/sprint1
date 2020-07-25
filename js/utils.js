'use strict';

function _getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setTimer() {
    gTimerInterval = setInterval(myTimer, 1000);
}

function myTimer() {
    gDeltaT = new Date() - gStart;
    // var deltaT = new Date() - gStart;
    gDeltaT = Math.floor(gDeltaT / 1000);
    var elTimer = document.querySelector('.timer');
    elTimer.querySelector('span').innerText = gDeltaT;
    // _getSecPassed(deltaT)
    gGame.secPasses = gDeltaT;
    // return gGame.secPasses;
    // console.log(gGame.secPasses);
}

function _getNegsCoords(posI, posJ) {
    var negsCoordsArr = [];
    var negCoords = {};
    // debugger
    for (var i = (posI - 1); i <= (posI + 1); i++) {
        if (i < 0 || i > (gBoard.length - 1)) continue;
        for (var j = (posJ - 1); j <= (posJ + 1); j++) {
            if ((i === posI && j === posJ) || j < 0 || j > (gBoard[0].length - 1)) continue;
            negCoords = { i: i, j: j }
            negsCoordsArr.push(negCoords);
        }

    }
    return negsCoordsArr;
}

function _getGameLevel(level) {
    gLevel = {
        level: level,
        SIZE: 4,
        MINES: 2,
        HINTS: 1,
        LIVES: 1
    }

    if (level === 'Beginner') return gLevel;

    switch (level) {
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gLevel.HINTS = 3;
            gLevel.LIVES = 3;
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gLevel.HINTS = 3;
            gLevel.LIVES = 3;
            break;
        default: break
    }

    return gLevel;
}

function _resetTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.querySelector('span').innerText = '0';
}

function _revealMines() {
    var elMines = document.querySelectorAll('.Mine span')
    for (var idx = 0; idx < gMinesLocs.length; idx++) {
        elMines[idx].classList.add('marked');
    }
}

function restart() {
    document.querySelector('.emoji-figure').innerText = '😊';
    document.querySelector('h2 span').innerText = 'Let\'s Play';
    initGame(gLevel.level);
}

function _getMarkedMines() {
    var flagsNotMinesArr = [];
    var cell;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            cell = gBoard[i][j];

            if (!cell.isMine && cell.isMarked) {
                flagsNotMinesArr.push({ i: i, j: j });
            }
        }
    }
    // console.log(flagsNotMinesArr);
    return flagsNotMinesArr;
}

//rendering number of CHEATS (lives OR HINTS) according to the level
function renderHints() {
    var htmlStr = '<h2>Hints</h2>'; // placing header before the hints buttons
    for (var i = 0; i < gLevel.HINTS; i++) {
        htmlStr += '<li><button '
        var cheatClassStr = `class="hint-${i + 1}"`
        htmlStr += cheatClassStr;
        htmlStr += ` onclick="_getHint(this)"><span>💡</span></button></li>`;
    }
    document.querySelector('.game-hints').innerHTML = htmlStr;
}

function renderLives() {
    var htmlStr = '<h2>Lives</h2>'; // placing header before the hints buttons
    for (var i = 0; i < gLevel.LIVES; i++) {
        htmlStr += `<li><span class="live-${i + 1}">😼</span></li>`;
    }
    document.querySelector('.game-lives').innerHTML = htmlStr;
}

// TODO support hint function - few seconds of SHOW
function _getHint(elHintBtn) {
    elHintBtn.style.visibility = 'hidden'; // toggle
    gGame.isHint = !gGame.isHint; // switching between on-off
}

function _showCells(posI, posJ) {
    var negsCoords = _getNegsCoords(posI, posJ);
    negsCoords.push({ i: posI, j: posJ });
    // var negsToUnReveal = negsCoords.slice(); // clone array - only coord that not shown now will enter it
    var shownCellIdx = []; // array contains the idx in the negs arr that are already shown -  
    console.log(negsCoords);
    // debugger
    for (var i = 0; i < negsCoords.length; i++) {
        var cell = gBoard[negsCoords[i].i][negsCoords[i].j];
        if (cell.isShown) shownCellIdx.push(i) // if the cell is already shown, splice it so it will stay shown after the hint pass
        cell.isShown = true;
    }
    // debugger
    // negsCoords.splice(shownCellIdx,1)
    // for (var i = 0; i < shownCellIdx.length; i++) {
    //     negsToUnReveal.splice
    // }
    _revealShown(gBoard);
    console.log(negsCoords);
    for (var i = 0; i < negsCoords.length; i++) {
        if (shownCellIdx.includes(i)) continue;
        var cell = gBoard[negsCoords[i].i][negsCoords[i].j];
        cell.isShown = false;
    }

    setTimeout(function () {
        _revealShown(gBoard);
        gGame.isHint = false;
    }, 1000)

}
