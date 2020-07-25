'use strict';

// Recieves  the board and a clicked cell with 0 mine around. recursively turnning its negs (and itself) to shown.
function _turnCellToShown(board, posI, posJ) {
    board[posI][posJ].isShown = true;
    var negsCoordsArr = [{ i: posI, j: posJ }];
    var negCoords = {};
    for (var i = (posI - 1); i <= (posI + 1); i++) {
        if (i < 0 || i > (board.length - 1)) continue;
        for (var j = (posJ - 1); j <= (posJ + 1); j++) {
            if ((i === posI && j === posJ) || j < 0 || j > (board[0].length - 1)) continue;
            var cell = board[i][j]
            if ((cell.minesAroundCount === 0) && !(cell.isShown)) {
                _turnCellToShown(board, i, j)
            }
            cell.isShown = true; // maybe unnecessary
            negCoords = { i: i, j: j }
            negsCoordsArr.push(negCoords);
        }

    }

}

// MIGHT BE A BETTER WAY GO BACK LATER - going through the board andd add VISIBILITY property to the SHOWN cells
function _revealShown(board) {
    console.log(board);
    gGame.shownCount = 0;
    var elSpan;
    var elCell;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isShown) {
                var negClassStr = '.span-' + i + '-' + j;
                var cellIdStr = '#cell-' + i + '-' + j;
                elSpan = document.querySelector(negClassStr); // for inner text use
                elCell = document.querySelector(cellIdStr); // for clickeng the cell
                elCell.classList.add('clicked'); // clicking the cell
                elSpan.classList.add('clicked'); // clicking the cell
                // elSpan.style.visibility = 'visible'; // renders the cell to visible
                gGame.shownCount++;
            } else if (!cell.isShown && !cell.isMarked){
                var negClassStr = '.span-' + i + '-' + j;
                var cellIdStr = '#cell-' + i + '-' + j;
                elSpan = document.querySelector(negClassStr); // for inner text use
                elCell = document.querySelector(cellIdStr); // for clickeng the cell
                elCell.classList.remove('clicked'); // UN-clicking the cell
                elSpan.classList.remove('clicked'); // UN-clicking the cell
                // elSpan.style.visibility = 'hidden'; // renders the cell to hidden
                gGame.shownCount--;
            }
        }
    }
}
