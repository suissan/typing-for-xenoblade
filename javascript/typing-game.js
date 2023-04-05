'use strict';

const getBody = document.body;
const entireTime = document.getElementById('entireTime');
const timer = document.getElementById('timer');
const container = document.getElementById('container');
const startCountDown = document.getElementById('startCountDown');
const startTitle = document.getElementById('startTitle');
const mainContents = document.getElementById('mainContents');
const xenoCharacterDisplay = document.getElementById('xenoCharacter');
const sentenceJaDisplay = document.getElementById('sentenceJaDisplay');
const typeDisplay = document.getElementById('typeDisplay');
const finishMessages = document.getElementById('finishMessages');
const finishMessageOne = document.getElementById('finishMessageOne');
const finishMessageTwo = document.getElementById('finishMessageTwo');
const noaSoundArray = ['noa1', 'noa2', 'noa3'];
const wrongSoundArray = ['miss1', 'miss2', 'miss3', 'miss4', 'miss5'];
const shoutSoundArray = ['shout1', 'shout2', 'shout3', 'shout4', 'shout5', 'shout6', 'shout7', 'shout8', 'shout9'];
const correctDialogueArray = ['correct1', 'correct2', 'correct3', 'correct4', 'correct5', 'correct6', 'correct7', 'correct8'];
const allCorrectSoundArray = ['allcorrect1', 'allcorrect2', 'allcorrect3', 'allcorrect4', 'allcorrect5', 'allcorrect6'];
const lastSoundArray = ['eunie-last', 'lanz-last', 'mio-last', 'mio-last-two', 'noah-last', 'sena-last', 'taion-last'];
const youWillRecallOurNames = new Audio('./audio/You-Will-Recall-Our-Names.mp3');
const chainAttack = new Audio("./audio/chain-attack.mp3");
const typeSound = new Audio("./audio/typing-sound.mp3");

import { romanMap } from './romanMap.js';
import { sentencesToBeTyped } from './sentences.js';

const splicedSentencesArray = [];

const typedKeyArray = [];

let canPushKey = false;

let countEight = 0;

let missCount = 0;
//let correctCount = 0;
/* inputテキスト入力 合っているかどうかの判定 */
addEventListener("keydown", (e) => {

    const KEY = e.key;

    // Shiftで"シフトキー"のみの入力を検知しないようにしている(!や?は打てる)
    if ((KEY === " " || KEY === "Shift") || !canPushKey) {
        return;
    }

    /* タイプ音をつける */
    if (countEight === 8) {
        createSound(shoutSoundArray, 'shout');
        countEight = 0;
    } else {
        typeSound.play();
        typeSound.currentTime = 0;
        countEight++;
    }

    typedKeyArray.push(KEY);

    const sentenceArray = typeDisplay.querySelectorAll("span") // typeDisplayの子要素に設定したスパンタグを取得 型は配列

    let correct = true; // タイピング成功のフラグ
    sentenceArray.forEach((characterSpan, index) => {
        if (typedKeyArray[index] == null) {
            characterSpan.classList.remove("correct");
            characterSpan.classList.remove("incorrect");
            correct = false;

            /* characterSpanとarrayValueでは同じものではないけど、
            characterSpanをforEachにかけたときのindexがarrayValueの要素を取るときに都合がいいからifでarrayValueにindexを使っている */
        } else if (
            (characterSpan.innerText === typedKeyArray[index]) || // 表示テキストと入力値が同値
            (characterSpan.id === typedKeyArray[index])) { // 別の打ち方で正解がどうか

            /* 上のフラグがtureの場合idを表記テキストの初期に変更(標準キーと別キー両方で打てる) */
            if (characterSpan.id === typedKeyArray[index]) {
                characterSpan.id = characterSpan.innerText;
                characterSpan.innerText = typedKeyArray[index];
            }
            characterSpan.classList.add("correct");
            characterSpan.classList.remove("incorrect");
        } else {
            typedKeyArray.splice(index, 1);
            missCount++;
            console.log(missCount)
            characterSpan.classList.add("incorrect");
            characterSpan.classList.remove("correct");
            createSound(wrongSoundArray, 'miss');
            correct = false;
        }
    });

    if (correct == true) {
        //console.log(timer.innerText);
        scoreFunc(sentenceArray);
        paused = true;
        canPushKey = false;
        const splicedSentence = sentencesToBeTyped.splice(randomIndex, 1);
        splicedSentencesArray.push(splicedSentence[0]);
        clearInterval(interval); // タイプ成功した瞬間にタイマーを止める
        if (sentencesToBeTyped.length === splicedSentencesArray.length) {
            stopBgm(youWillRecallOurNames);
            createSound(lastSoundArray, 'last', 'ended')
                .then(() => {
                    container.style.opacity = 0.8;
                    getBody.style.backgroundImage = 'url(../image/nia2.jpg)';
                    playBgm(chainAttack, 0.4, true);
                    renderNextSentence();
                });
            return;
        } else if (sentencesToBeTyped.length === 0) {
            const chainAttackFan = new Audio("./audio/chain-attack-fan.mp3");
            timer.style.display = "none";
            invisibleElement(mainContents, true);
            finishMessageOne.style.display = "block";
            finishMessageOne.innerText = 'CHAIN ATTACK FINISH';
            arrayToArray(splicedSentencesArray, sentencesToBeTyped);
            splicedSentencesArray.length = 0;
            stopBgm(chainAttack);
            playBgm(chainAttackFan, 0.5, false, 'ended')
                .then(() => {
                    createSound(allCorrectSoundArray, 'allcorrect', false);
                    finishMessageTwo.style.display = 'block';
                    finishMessageTwo.innerText = 'Restart Please Space key';
                    startFlag = true;
                });
            return;
        }
        createSound(correctDialogueArray, 'correct', 'ended')
            .then(() => {
                renderNextSentence();
            });
    }
});

let startFlag = true;

/* 開始時のスペースキーの処理 */
addEventListener('keydown', (event) => {
    /* スペースキーだったら */
    if (event.key === " " && startFlag === true) {
        startFlag = false;
        container.style.opacity = 1;
        getBody.style.backgroundImage = 'url(../image/nia1.jpg)';
        startCountDown.style.display = "block";
        startCountDownFnc();
        createSound(noaSoundArray, 'start');
        invisibleElement(startTitle, false);
        invisibleElement(finishMessages, true);
        setTimeout(() => {
            visibleAllChildren(mainContents);
            timer.style.display = "block";
            canPushKey = true;
            renderNextSentence();
            gameTime();
            playBgm(youWillRecallOurNames, 0.05, true);
        }, 3000);
    }
    return;
});

let randomIndex;
/* ランダムな文章を取得して、表示する */
function renderNextSentence() {
    randomIndex = Math.floor(Math.random() * sentencesToBeTyped.length); // ランダムなインデックスを作成
    const displayedSentence = sentencesToBeTyped[randomIndex].sentenceJa; // 表示される文章を取得
    const sentenceJaType = sentencesToBeTyped[randomIndex].sentence.split(""); // タイピングされる文章を配列形式で取得格納
    const xenoCharacter = sentencesToBeTyped[randomIndex].chara; // セリフのキャラクター
    xenoCharacterDisplay.innerText = `${xenoCharacter} :`;

    /* sentenceJaTypeで1文字ずつに分割された文字を本来の形に戻す 例 'し', 'ゃ' → 'しゃ' として格納 */
    for (let i = 0; i < sentenceJaType.length; i++) {
        let joinString = sentenceJaType[i] + sentenceJaType[i + 1];
        if (romanMap[joinString]) {
            sentenceJaType.splice(i, 2, joinString);
        }
    }

    /* 漢字など含めて本来の文章を表示 */
    sentenceJaDisplay.innerText = displayedSentence;

    /* 表示エリアを初期化またはリセット */
    typeDisplay.innerText = "";

    /* 文章を1文字ずつ分解して、spanタグを生成する */
    sentenceJaType.forEach((character, index) => {

        /* 「っ」の判定処理 */
        if (character === 'っ') {
            if (romanMap[sentenceJaType[index + 1]].inputTwo) {
                const defaultInput = romanMap[sentenceJaType[index + 1]].inputOne.split("");
                const anotherInput = romanMap[sentenceJaType[index + 1]].inputTwo.split("");
                for (let i = 0; i <= 2; i++) {
                    if (i === 2) {
                        defaultInput.splice(0, 1);
                        anotherInput.splice(0, 1);
                        defaultInput.forEach((character, index) => {
                            createSpanAndAppendChild(character, anotherInput[index]);
                        });
                        sentenceJaType.splice(index + 1, 1);
                        return;
                    }
                    createSpanAndAppendChild(defaultInput[0], anotherInput[0]);
                }
            } else {
                const temporarySplit = romanMap[sentenceJaType[index + 1]].split("");
                for (let i = 0; i <= 2; i++) {
                    if (i === 2) {
                        temporarySplit.splice(0, 1);
                        temporarySplit.forEach((character) => {
                            createSpanAndAppendChild(character);
                        });
                        sentenceJaType.splice(index + 1, 1);
                        return;
                    }
                    createSpanAndAppendChild(temporarySplit[0]);
                }
                return;
            }
            return;
        }

        /* 入力パターンが複数ある場合の分岐処理*/
        if (romanMap[character].inputTwo) {
            const defaultInput = romanMap[character].inputOne.split(""); // romanMapの値がオブジェクト「inputOne」を取得格納
            const anotherInput = romanMap[character].inputTwo.split(""); // romanMapの値がオブジェクト「inputTwo」を取得格納
            for (let i = 0; i < defaultInput.length; i++) {
                createSpanAndAppendChild(defaultInput[i], anotherInput[i]);
            }
        } else {
            const temporarySplit = romanMap[character].split("");

            /* sentenceJaTypeの文章中に全角空白がある場合、それを印として改行する */
            if (temporarySplit[0] === romanMap['　']) {
                createBrFunc();
                return;
            }

            for (let i = 0; i < temporarySplit.length; i++) {
                createSpanAndAppendChild(temporarySplit[i]);
            }

            /* 句読点があるとき改行をする処理 */
            if (temporarySplit[0] === romanMap['、']) {
                createBrFunc();

            }
        }
    });

    /*テキストボックスの中身を消す */
    typedKeyArray.length = 0;

    paused = false;

    canPushKey = true;

    startTimer();
}

/**
 * スパンタグを作成し、innerTextに引数に取った値を代入、typeDisplayに子要素として追加
 * @param {String} eachCharacter タイプするローマ字
 * @param {String} anotherInput 別のキーの入力
*/
function createSpanAndAppendChild(eachCharacter, anotherInput) {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = eachCharacter;
    typeDisplay.appendChild(characterSpan);
    if (anotherInput) {
        characterSpan.id = anotherInput;
    }
}

function createBrFunc() {
    const createBr = document.createElement('br');
    typeDisplay.appendChild(createBr);
}

let startTime;
let interval;
/**
 * タイプ時間のカウントダウンをする関数
 */
function startTimer() {
    const originTime = 15; // 15から引くことはするけど timer.innerText に 30から引いた値を代入するため定数30そのものは変わらない
    timer.innerText = originTime;
    startTime = new Date(); // 1番最初に起動
    interval = setInterval(() => {
        timer.innerText = originTime - getTimerTime();
        if (timer.innerText <= 0) {
            clearInterval(interval); // バグの温床を防ぐ処理
            timeUp();
        }
    }, 1000);
}

/* startTimeは固定だから 今(newDate()) - startTime で1秒立つたびに差が1秒増える → return 1... return 2 */
function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

/**
 * 制限時間を超えたら次の文章に移る処理
*/
function timeUp() {
    renderNextSentence();
}

/**
 * 音源を鳴らす関数
 * @param {Array} soundsArray 各音源の格納されている配列
 * @param {String} path 音源の入っているフォルダ
 * @param {Boolean} torF trueを取り、renderNextSentenceを実行する
 */
function createSound(soundsArray, path, isEnded) {
    const soundIndex = Math.floor(Math.random() * soundsArray.length);
    const sound = new Audio(`./audio/${path}/${soundsArray[soundIndex]}.mp3`);
    sound.currentTime = 0;
    sound.volume = 0.7;
    sound.play();
    return new Promise((resolve) => {
        sound.addEventListener(isEnded, () => {
            resolve();
        });
    });
}

/**
 * BGMをならす関数
 * @param {Object} bgm newで宣言したBGM
 * @param {Number} volume 音量調節の数字
 * @param {Boolean} trueORfalseでtrueならBGMをループ
 * @param {String} isEnded 'ended'を入れてsoundが終わってからのプロミス処理をする
*/
function playBgm(bgm, volume, isLoop, isEnded) {
    bgm.currentTime = 0;
    bgm.volume = volume;
    bgm.loop = isLoop;
    bgm.play();
    return new Promise((resolve) => {
        bgm.addEventListener(isEnded, () => {
            resolve();
        });
    });
}

/**
 * playBgmでならしたBGMを停止させる関数
 * @param {Object} bgm newで宣言したBGM
*/
function stopBgm(bgm) {
    bgm.pause();
}

/**
 * 開始時の3秒カウントダウンをする関数
*/
function startCountDownFnc() {
    startCountDown.innerText = 3;
    let second = 3;
    let count = 0;
    let timerId = setInterval(() => {
        count++;
        startCountDown.innerText = second - 1;
        second -= 1;
        if (count === 3) {
            clearInterval(timerId);
            invisibleElement(startCountDown, false);
        }
    }, 1000);
}

/**
 * 親要素ごと、もしくは親要素の持っている子要素を非表示にする関数
 * @param {HTMLElement} element 判定する親要素
 * @param {Boolean} isInvisibleEachChildren trueORfalseでtrueならelementで指定した親要素の子要素を個々で非表示にする
*/
function invisibleElement(element, isInvisibleEachChildren) {
    if (isInvisibleEachChildren) {
        for (let i = 0; i < element.childElementCount; i++) {
            element.children[i].style.display = "none";
        }
    } else {
        element.style.display = "none";
    }
}

/**
 * 親要素が持っている非表示になっている子要素を表示する関数
 * @param {HTMLElement} element 非表示になっている子要素を持っている親要素
*/
function visibleAllChildren(element) {
    for (let i = 0; i < element.childElementCount; i++) {
        element.children[i].style.display = "block";
    }
    return;
}

/**
 * sentencesToBeTypedの中身を元に戻す関数
 * @param {Array} sourceArray splicedSentencesArrayが入る
 * @param {Array} newArray sentencesToBeTypedが入る
*/
function arrayToArray(sourceArray, newArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        newArray.push(sourceArray[i]);
    }
}

let paused = false; // 時間経過のフラグ
let entireTimerId;
/**
 * タイピングゲーム全体の制限時間を処理する関数
 */
function gameTime() {
    let entire = 5;
    entireTime.innerText = `残り ${entire} 秒`;
    entireTimerId = setInterval(() => {
        /** pausedがtrueになるとreturnで後続の処理がされなくて時間経過が一時停止する */
        if (paused) {
            return;
        }
        entire--;
        entireTime.innerText = `残り ${entire} 秒`;
        if (entire <= 0) {
            clearInterval(entireTimerId);
        }
    }, 1000);
}

const scoreDisplay = document.getElementById('score');
let score = 0;

function scoreFunc(sentence) {
    const LengthOfTargetText = sentence.length; // 文章の長さ
    const tentativeScore = LengthOfTargetText * 10; // tentative → 「仮の」
    const finalyScore = tentativeScore; // ここからもっと細かくする予定
    score += finalyScore;
    scoreDisplay.innerText = score;
}

//console.log('test');
//console.log(sentencesToBeTyped.length); 