'use strict';

const scoreDisplay = document.getElementById('score');

function scoreFunc() {
    let score = 0;
    scoreDisplay.innerText = score;
}

export { scoreFunc };