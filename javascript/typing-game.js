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
const scoreDisplay = document.getElementById('score');
const bonusScoreDisplay = document.getElementById('bonusScore');
const finallyScoreDisplay = document.getElementById('finallyScore');
const totalMissDisplay = document.getElementById('totalMiss');
const noaSoundArray = ['noa1', 'noa2', 'noa3'];
const wrongSoundArray = ['miss1', 'miss2', 'miss3', 'miss4', 'miss5'];
const shoutSoundArray = ['shout1', 'shout2', 'shout3', 'shout4', 'shout5', 'shout6', 'shout7', 'shout8', 'shout9'];
const correctDialogueArray = ['correct1', 'correct2', 'correct3', 'correct4', 'correct5', 'correct6', 'correct7', 'correct8'];
const allCorrectSoundArray = ['allcorrect1', 'allcorrect2', 'allcorrect3', 'allcorrect4', 'allcorrect5', 'allcorrect6'];
const lastSoundArray = ['eunie-last', 'lanz-last', 'mio-last', 'mio-last-two', 'noah-last', 'sena-last', 'taion-last'];
const youWillRecallOurNames = new Audio('./audio/You-Will-Recall-Our-Names.mp3');
const chainAttack = new Audio("./audio/chain-attack.mp3");
const typeSound = new Audio("./audio/typing-sound.mp3");

(() => {
    invisibleElement(finishMessages, true);
    invisibleElement(timer, false);
})();

import { romanMap } from './romanMap.js';
import { sentencesToBeTyped } from './sentences.js';

const typedKeyArray = [];

const scoreStr = 'Score: ';

let canPushKey = false;

let countEight = 0;

let missCounter = 0; // 1文章についてのミス回数

let totalMissCounter = 0; // ミスタイプの総数

/* inputテキスト入力 合っているかどうかの判定 */
addEventListener("keydown", (e) => {

    const KEY = e.key;

    // Shiftで"シフトキー"のみの入力を検知しないようにしている(!や?は打てる)
    if ((KEY === " " || KEY === "Shift") || !canPushKey) {
        return;
    }

    /* タイプ音をつける */
    if (countEight === 8) {
        createSound(shoutSoundArray, 'shout', 'mp3');
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
            missCounter++;
            totalMissCounter++;
            characterSpan.classList.add("incorrect");
            characterSpan.classList.remove("correct");
            createSound(wrongSoundArray, 'miss', 'mp3');
            correct = false;
        }
    });

    /* タイプ成功 */
    if (correct == true) {
        scoreFunc(sentenceArray, timer.innerText, missCounter);
        existingIndexes.push(randomIndex);
        paused = true;
        canPushKey = false;
        clearInterval(interval); // タイプ成功した瞬間にタイマーを止める

        if ((Math.round(sentencesToBeTyped.length / 2)) === existingIndexes.length) {
            stopBgm(youWillRecallOurNames);
            createSound(lastSoundArray, 'last', 'mp3', 'ended')
                .then(() => {
                    getBody.style.backgroundImage = 'url(../image/wllppr2.png)'; // 開発用
                    //getBody.style.backgroundImage = 'url(https://github.com/suissan/typing-for-xenoblade/blob/main/image/nia2.jpg?raw=true)'; // 実践用
                    playBgm(chainAttack, 0.4, true);
                    renderNextSentence();
                });
            return;
        } else if (sentencesToBeTyped.length === existingIndexes.length) {
            const chainAttackFan = new Audio("./audio/chain-attack-fan.mp3");
            clearInterval(entireTimerId);
            timer.style.display = "none";
            invisibleElement(entireTime, false);
            invisibleElement(mainContents, true);
            finishMessageOne.style.display = "block";
            finishMessageOne.innerText = 'CHAIN ATTACK FINISH';
            existingIndexes.length = 0;
            stopBgm(chainAttack);
            playBgm(chainAttackFan, 0.5, false, 'ended')
                .then(finishGame);
            return;
        }
        createSound(correctDialogueArray, 'correct', 'mp3', 'ended')
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
        init();
        startCountDownFnc();
        createSound(noaSoundArray, 'start', 'mp3');
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

function init() {
    startFlag = false;
    score = 0;
    totalMissCounter = 0;
    startCountDown.style.display = "block";
    getBody.style.backgroundImage = 'url(../image/wllppr.png)'; // 開発用
    //getBody.style.backgroundImage = 'url(https://github.com/suissan/typing-for-xenoblade/blob/main/image/nia1.jpg?raw=true)'; // 実践用
    invisibleElement(entireTime, false);
    invisibleElement(startTitle, false);
    invisibleElement(finishMessages, true);
}

const existingIndexes = [];

let randomIndex;
/* ランダムな文章を取得して、表示する */
function renderNextSentence() {
    do {
        randomIndex = Math.floor(Math.random() * sentencesToBeTyped.length); // ランダムなインデックスを作成
    } while (existingIndexes.includes(randomIndex));

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

    missCounter = 0;

    startTimer();

    //autoType(); //テストが面倒な時に使う
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
        }
    }, 1000);
}

/**
 * startTimeは固定だから 今(newDate()) - startTime で1秒立つたびに差が1秒増える → return 1... return 2
 */
function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

const audioDir = './audio/'; // audioディレクトリの名前が変わってもここですぐに変更できるように変数に格納

/**
 * 音源を鳴らす関数
 * @param {Array} soundsArray 各音源の格納されている配列
 * @param {String} path 音源の入っているフォルダ
 * @param {String} fileType ファイルの拡張子
 * @param {Event} isEnded 'ended'を入れるとsoundが鳴り終わり次第プロミスの処理を実行する
 */
function createSound(soundsArray, path, fileType = 'mp3', isEnded = 'ended') {
    const soundIndex = Math.floor(Math.random() * soundsArray.length);
    const sound = new Audio(`${audioDir}${path}/${soundsArray[soundIndex]}.${fileType}`);

    sound.volume = 0.7;
    sound.play();

    return new Promise(resolve => {
        sound.addEventListener(isEnded, resolve);
        sound.addEventListener('error', reject => console.log(`Error: ${reject}`));
    });
}

/**
 * BGMをならす関数
 * @param {Object} bgm newで宣言したBGM
 * @param {Number} volume 音量調節の数字
 * @param {Boolean} isLoop trueならBGMをループ
 * @param {Event} isEnded 'ended'を入れるとBGMが終わり次第プロミスの処理を実行する
*/
function playBgm(bgm, volume, isLoop, isEnded = 'ended') {
    bgm.currentTime = 0; // リスタートの時にBGMの進行状況をリセットする

    bgm.volume = volume;
    bgm.loop = isLoop;
    bgm.play();

    return new Promise(resolve =>
        bgm.addEventListener(isEnded, resolve)
    );
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
    let second = 3;
    startCountDown.innerText = second;
    const startTimerId = setInterval(() => {
        second--;
        startCountDown.innerText = second;
        if (second === 0) {
            clearInterval(startTimerId);
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

let paused = false; // 時間経過のフラグ
let entireTimerId;

/**
 * タイピングゲーム全体の制限時間を処理する関数
 * 最終的に、残り時間もスコアの評価に入れることにするため、今は使わなくてもこの関数は残しておく
 */
function gameTime() {
    entireTime.style.display = "block";
    let entire = 180;
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

let score = 0;

/**
 * 
 * @param {String} sentence ターゲットの文章
 * @param {Number} finishTime タイプを終えた時間
 * @param {Number} missCount ミスした回数
 * @returns スコア
 */
function scoreFunc(sentence, finishTime, missCount) {

    const averageKeySpeed = 5; // 1秒間に叩けるキーの数
    const sentenceLength = sentence.length; // 文章の長さ
    const averageTypeSpeed = sentenceLength / averageKeySpeed; // タイプ文章を打ち終わる平均時間
    const takenTime = 15 - finishTime; // 実際にかかった時間
    let tentativeScore = sentenceLength * 10; // tentative → 「仮の」

    if (missCount >= 10) { // ミスが10以上あった場合
        return score;
    }

    if (finishTime <= 0) {
        return score += Math.floor((tentativeScore * 0.2) / 10) * 10; // タイムが0以降
    }

    if ((takenTime <= averageTypeSpeed) && (missCount === 0)) { // 平均時間より速い且つミス数が0
        score += Math.floor(tentativeScore / 10) * 10;
    } else if ((takenTime <= averageTypeSpeed) && (missCount >= 1)) { // 平均時間より速い且つミス数が1以上10以内
        score += Math.floor((tentativeScore * 0.8) / 10) * 10;
    } else if ((takenTime >= averageTypeSpeed) && (missCount === 0)) { // 平均時間より遅いがミス数が0
        score += Math.floor((tentativeScore * 0.7) / 10) * 10;
    } else if (takenTime >= averageTypeSpeed) { // その他(平均時間より遅くミス数が1以上10以内)
        score += Math.floor((tentativeScore * 0.5) / 10) * 10;
    }

    //return score;
}

function calculateBonusScore(endTime, totalMiss) {
    /* \d+で[1-9]までの数字を探し、matchで数字のみ抽出 */
    const target = endTime.match(/\d+/g); // 配列で還ってくる
    const originScore = parseInt(target[0]) * 10;

    /* 減点率を計算 */
    const reductionRate = totalMiss / 100; // ミス回数を元スコアの1%とした場合

    /* 減点後の最終ボーナススコア */
    const bonusScore = Math.floor((originScore * (1 - reductionRate)) / 10) * 10;

    return bonusScore;
}

function calculateFinallyScore(bonusScore) {
    let finallyScore = score;

    finallyScoreDisplay.style.display = 'block';

    /* ボーナス得点の加算アニメーション */
    if (finallyScore !== (score + bonusScore)) {
        const countUpInterval = setInterval(() => {
            finallyScore += 1;
            finallyScoreDisplay.innerText = `Finally ${scoreStr}${finallyScore}`;
            (finallyScore === (score + bonusScore)) ? clearInterval(countUpInterval) : "";
            return;
        }, 10);
    } else {
        finallyScoreDisplay.innerText = `Finally ${scoreStr}${finallyScore}`; // ボーナススコアが0だった場合
    }
}

function finishGame() {
    createSound(allCorrectSoundArray, 'allcorrect', 'mp3');
    const bonusScore = calculateBonusScore(entireTime.innerText, totalMissCounter);
    calculateFinallyScore(bonusScore);
    scoreDisplay.style.display = 'block';
    scoreDisplay.innerText = `${scoreStr}${score}`;
    bonusScoreDisplay.style.display = 'block';
    bonusScoreDisplay.innerText = `Bonus ${scoreStr}${bonusScore}`;
    totalMissDisplay.style.display = 'block';
    totalMissDisplay.innerText = `Total Miss: ${totalMissCounter}`;
    finishMessageTwo.style.display = 'block';
    finishMessageTwo.innerText = 'Restart Please Space key';
    startFlag = true;
}

function autoType() {
    const array = [];
    const sentenceArray = typeDisplay.querySelectorAll("span");
    sentenceArray.forEach((character, index) => {
        array.push(character.innerText);
    });
    for (let i = 0; i < array.length; i++) {
        setTimeout(() => {
            const KEvent = new KeyboardEvent("keydown", { key: array[i] });
            dispatchEvent(KEvent)
        }, i * 130);
    }
}
