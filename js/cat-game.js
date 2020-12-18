const MESSAGES = {
    speech : [
        "Подать мне клубок!",
        "Клубок в мои лапы!",
        "Мне нужен клубок!",
        "Клубочек...",
        "Мне клубочек...",
        "Ловлю!",
        "Моя очередь."
    ],
    result : {
        win : "Ура! Котики довольны.<br>Поздравляем!",
        loss : "Коты огорчены..."
    }
};
const WIN = 5;
const LOSS = -5;
const TIME_ROUND = 1500;
const TIME_BALL_MOVE = 500;
const TIME_BETWEEN_ROUNDS = 500;

class Game {
    constructor (id) {
        this.game = $(id);
        this.ball = this.game.children(".game__ball");
        this.speechBoxes = this.game.children(".game__speech-box");
        this.gates = this.game.children(".game__paw");
        this.score = this.game.find(".score__value");
        this.resultBox = this.game.children(".game__finish");
        this.result = this.resultBox.children(".game__result");
        this.btn = this.resultBox.children(".game__close-btn");
        this.lastSpeech = null;
        this.prevCat = null;
        this.sameCatTimes = 1;
        this.scoreValue = 0;
        this.isRoundStarted = false;
        this.ballPosition = null;
        // this.isGameStarted = false;
        this.createEvents();
    }
    startGame (ev) {
        this.lastSpeech = null;
        this.prevCat = null;
        this.sameCatTimes = 1;
        this.scoreValue = 0;
        // this.isGameStarted = true;
        console.log("startGame");
        console.log("isRoundStarted - ", this.isRoundStarted);
        // let score = 0;
        // // do {
        //     if (!this.isRoundStarted) {
        //         this.playRound();
        //         // score = this.playRound(); 
        //         // console.log(score);
        //     }
        //     // this.scoreValue++;
        // // } while (score < 5);
        this.startRound();
        // if (!this.isRoundStarted) {
        //     this.playRound(); 
        // }
        // this.playRound();
        // setInterval(this.playRound.bind(this), TIME_ROUND + 500);
        // this.game.click(this.playRound.bind(this));
    }
    startRound () {
        console.log("startRound");
        console.log(this.isRoundStarted);
        console.log("scoreValue - ", this.scoreValue);
        // console.log(this.scoreValue);
        // do {
            if (!this.isRoundStarted && this.scoreValue > LOSS && this.scoreValue < WIN) {
                setTimeout(() => this.playRound(), TIME_BETWEEN_ROUNDS);
                // score = this.playRound(); 
                // console.log(score);
            } else if (!this.isRoundStarted) {
                this.resultBox.removeClass("display-none");
                if (this.scoreValue <= LOSS) {
                    this.result.html(MESSAGES.result.loss);
                } else if (this.scoreValue >= WIN) {
                    this.result.html(MESSAGES.result.win);
                }
            }
            // this.scoreValue++;
        // } while (this.scoreValue < 5);
    }
    playRound () {
        this.ballPosition = null;
        this.isRoundStarted = true;
        console.log("isRoundStarted - ", this.isRoundStarted);
        console.log('playRound');

        this.gates.addClass("display-none");
        this.speechBoxes.addClass("display-none");

        //to avoid cat-repeat more than 3 times
        let currentCat = Math.round((this.gates.length - 1) * Math.random() + 1);
        this.prevCat === currentCat ? this.sameCatTimes++ : this.sameCatTimes = 1;        
        if (this.sameCatTimes > 3) {
            do {
                currentCat = Math.round((this.gates.length - 1) * Math.random() + 1);
            } while (this.prevCat === currentCat);
            this.sameCatTimes = 1;
        }
        this.prevCat = currentCat;

        //to avoid speech-repeat
        let speech = null;
        do {
            speech = Math.round((MESSAGES.speech.length - 0) * Math.random() + 0);
        } while (this.lastSpeech === speech);
        this.lastSpeech = speech;

        let currentSpeechBox = this.game.children(`.game__speech-box--${currentCat}`);
        currentSpeechBox.removeClass("display-none");
        currentSpeechBox.text(MESSAGES.speech[speech]);
        
        console.log("🚀 ~ file: cat-game.js ~ line 49 ~ Game ~ playRound ~ currentCat", currentCat);
        let currentGate = this.game.children(`.game__paw--${currentCat}`);
        currentGate.removeClass("display-none");
        currentGate.css("--time-round",`${TIME_ROUND / 1000}s`); //css var for .paw-animation
        currentGate.addClass("paw-animation");
        
        //currentSpeechBox disappear earlier than currentGate, 
        //this is the last chance to hit the ball to score a goal
        //because the ball will be in the pointed place in TIME_BALL_MOVE ms,
        //so the score is counted here:
        setTimeout(() => {
            currentSpeechBox.addClass("display-none");
            this.ballPosition != null && this.ballPosition.hasClass(`game__paw--${currentCat}`) ? this.scoreValue++ : this.scoreValue--;
            setTimeout(() => {
                currentGate.removeClass("paw-animation");
                currentGate.addClass("display-none");
                this.isRoundStarted = false;
                this.score.text(this.scoreValue);
                console.log("scoreValue inside timeout - ", this.scoreValue);
                this.startRound();
                // return this.scoreValue;
            }, TIME_BALL_MOVE);
        }, TIME_ROUND - TIME_BALL_MOVE);
        // let scoreR = 
        // (async  function() {
        //     let scoreA = await setTimeout(() => {
        //         // if (this.ballPosition.hasClass(`game__paw--${currentCat}`)) {
        //         //     this.moveBall()
        //         // }
        //         currentGate.removeClass("paw-animation");
        //         currentGate.addClass("display-none");
        //         this.isRoundStarted = false;
        //         this.score.text(this.scoreValue);
        //         console.log(this.scoreValue);
        //         return this.scoreValue;
        //     }, TIME_ROUND);
        //     console.log(await scoreA);
        //     // return scoreA;
        // })();

        // let scoreR = setTimeout(() => {
        //     // if (this.ballPosition.hasClass(`game__paw--${currentCat}`)) {
        //     //     this.moveBall()
        //     // }
        //     currentGate.removeClass("paw-animation");
        //     currentGate.addClass("display-none");
        //     this.isRoundStarted = false;
        //     this.score.text(this.scoreValue);
        //     console.log(this.scoreValue);
        //     return this.scoreValue;
        // }, TIME_ROUND);

        // console.log(scoreR);
        // return scoreR;
    }
    
    moveBall (e) {
        // this.ballPosition = null;
        if (e) {
        // let xStart = this.ball[0].getBoundingClientRect().left;
        // let yStart = this.ball[0].getBoundingClientRect().top;
        this.ball.css({"--xEnd":`calc(${e.clientX}px - 10vmin`,
                        "--yEnd":`calc(${e.clientY}px - 5vmin`,
                        "--degEnd":`${Math.round(360 * Math.random())}deg`,
                        "--move-time":`${TIME_BALL_MOVE / 1000}s`});
        this.ball.addClass("ball-move");
        this.ballPosition = $(e.target);
        }
    }
    createEvents () {
        this.resultBox.addClass("display-none");
        this.gates.addClass("display-none");
        this.ball.one("click", this.startGame.bind(this));
        // this.ball.one("click", this.startRound.bind(this));

        this.game.click(this.moveBall.bind(this));
    }
}
let game = new Game ("#game");