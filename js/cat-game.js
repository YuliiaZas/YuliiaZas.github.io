const MESSAGES = {
    start : [
        "Поиграй с нами! <br>Нажми на клубок",
        "Набери 5 Мяу"
    ],
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
        this.btn = this.resultBox.children(".game__ok-btn");

        console.log(this.btn)

        this.lastSpeech = null;
        this.prevCat = null;
        this.sameCatTimes = 1;
        this.scoreValue = 0;

        this.isGameStarted = false;
        this.ballPosition = null;

        this.createEvents();
    }

    startGameScreen () {
        console.log(this.resultBox);
        this.lastSpeech = null;
        this.prevCat = null;
        this.sameCatTimes = 1;
        this.scoreValue = 0;       
        this.resultBox.addClass("display-none");
        this.gates.addClass("display-none");
        this.score.text(this.scoreValue);
        this.speechBoxes.removeClass("display-none");
        $.each(this.speechBoxes, (i,item) => {
            $(item).html(MESSAGES.start[i]);
        });

        this.ball.one("click", this.playGame.bind(this));
    }

    playGame () {
        if (this.scoreValue > LOSS && this.scoreValue < WIN) {

            setTimeout(() => this.playRound(), TIME_BETWEEN_ROUNDS);
        } else  {
            this.resultBox.removeClass("display-none");
            // console.log("window.history");
            // console.log(window.history);
            if (this.scoreValue <= LOSS) {
                this.result.html(MESSAGES.result.loss);
            } else if (this.scoreValue >= WIN) {
                this.result.html(MESSAGES.result.win);
            }
        }
    }

    playRound () {
        this.ballPosition = null;
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
        
        let currentGate = this.game.children(`.game__paw--${currentCat}`);
        currentGate.removeClass("display-none");
        currentGate.css("--time-round",`${TIME_ROUND / 1000}s`); //css var for .paw-animation
        currentGate.addClass("paw-animation");
        
        //currentSpeechBox disappear earlier than currentGate, 
        //this is the last chance to hit the ball to score a goal.
        //the ball will be in the pointed place in TIME_BALL_MOVE ms,
        //so the score is counted here:
        setTimeout(() => {
            currentSpeechBox.addClass("display-none");
            this.ballPosition && this.ballPosition.hasClass(`game__paw--${currentCat}`) ? 
                    this.scoreValue++ : this.scoreValue--;
            setTimeout(() => {
                currentGate.removeClass("paw-animation");
                currentGate.addClass("display-none");
                this.score.text(this.scoreValue);

                if (this.ballPosition && this.ballPosition.hasClass(`game__paw--${currentCat}`)) {
                    this.moveBall()
                };

                this.playGame();
            }, TIME_BALL_MOVE);
        }, TIME_ROUND - TIME_BALL_MOVE);
    }
    
    moveBall (e) {
        let gameYTop = this.game[0].getBoundingClientRect().top;
        let gameXLeft = this.game[0].getBoundingClientRect().left;
        
        let gameHeight = this.game[0].getBoundingClientRect().height;
        let gameWidth = this.game[0].getBoundingClientRect().width;
        
        let ballDiam = this.ball[0].getBoundingClientRect().width;

        let xRandom = Math.round((gameWidth - ballDiam) * Math.random());
        let yRandom = Math.round((gameHeight - ballDiam) * Math.random());
                
        if (e) {
            let clickY = e.clientY - gameYTop;
            let clickX = e.clientX - gameXLeft;
            this.ball.css({"--xEnd":`${clickX - ballDiam / 2}px`,
                            "--yEnd":`${clickY - ballDiam / 2}px`});

            this.ballPosition = $(e.target);
        } else {
            this.ball.css({"--xEnd":`${xRandom}px`,
                            "--yEnd":`${yRandom}px`});
        };

        this.ball.css({"--degEnd":`${Math.round(360 * Math.random())}deg`,
                        "--move-time":`${TIME_BALL_MOVE / 1000}s`});
        this.ball.addClass("ball-move");
    }

    createEvents () {
        this.startGameScreen();
        this.game.click(this.moveBall.bind(this));
        this.btn.click(this.startGameScreen.bind(this));
    }
}
let game = new Game ("#game");