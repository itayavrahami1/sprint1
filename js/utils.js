'use strict';

function _getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setTimer(gStart) {
    gTimerInterval = setInterval(myTimer, 1000);
}

function myTimer() {
    var deltaT = new Date() - gStart;
    deltaT = Math.floor(deltaT / 1000);
    var elTimer = document.querySelector('.timer');
    elTimer.querySelector('span').innerText = deltaT;
    gGame.secPasses = deltaT;
}

function _getNegsCoords(board, posI, posJ) {
    var negsCoordsArr = [];
    var negCoords = {};
    for (var i = (posI - 1); i <= (posI + 1); i++) {
        if (i < 0 || i > (board.length - 1)) continue;
        for (var j = (posJ - 1); j <= (posJ + 1); j++) {
            if ((i === posI && j === posJ) || j < 0 || j > (board[0].length - 1)) continue;
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

function _resetTimet() {
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

function _getHint(elHint) {
    console.log(elHint);
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
    return flagsNotMinesArr;
}