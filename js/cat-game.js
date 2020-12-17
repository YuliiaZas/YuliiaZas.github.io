const MESSAGES = [
    "Подать мне клубок!",
    "Клубок в мои лапы!",
    "Мне нужен клубок!",
    "Клубочек...",
    "Мне клубочек...",
    "Ловлю!",
    "Моя очередь."
];
const WIN = 5;
const TIMEOUT = 1500;
const MOVETIME = 500;

// let currentCat = Math.floor(Math.random() * 2 + 1);
// let speech = Math.round((MESSAGES.length - 0) * Math.random());
// console.log("🚀 ~ file: cat-game.js ~ line 11 ~ currentCat", currentCat);
// console.log("🚀 ~ file: cat-game.js ~ line 13 ~ speech", speech);

class Game {
    constructor (id) {
        this.game = $(id);
        this.ball = this.game.children(".game__ball");
        this.speechBoxes = this.game.children(".game__speech-box");
        this.gates = this.game.children(".game__paw");
        this.score = this.game.find(".score__value");
        this.lastSpeech = null;
        this.prevCat = null;
        this.sameCatTimes = 1;
        this.scoreValue = 0;
        // this.isGameStarted = false;
        this.createEvents();
    }
    startGame (ev) {
        // this.isGameStarted = true;
        console.log("startGame");

        this.startRounds();
        setInterval(this.startRounds.bind(this), TIMEOUT + 500);
        // this.game.click(this.startRounds.bind(this));
    }
    startRounds (e) {
        console.log('startRounds');
        this.gates.addClass("display-none");
        this.speechBoxes.addClass("display-none");
        
        let currentCat = Math.round((this.gates.length - 1) * Math.random() + 1);
        this.prevCat === currentCat ? this.sameCatTimes++ : this.sameCatTimes = 1;        
        if (this.sameCatTimes > 3) {
            do {
                currentCat = Math.round((this.gates.length - 1) * Math.random() + 1);
            } while (this.prevCat === currentCat);
            this.sameCatTimes = 1;
        }
        this.prevCat = currentCat;
        
        let speech = null;
        do {
            speech = Math.round((MESSAGES.length - 0) * Math.random() + 0);
        } while (this.lastSpeech === speech);
        this.lastSpeech = speech;

        let currentSpeechBox = this.game.children(`.game__speech-box--${currentCat}`);
        currentSpeechBox.removeClass("display-none");
        currentSpeechBox.text(MESSAGES[speech]);
        
        console.log("🚀 ~ file: cat-game.js ~ line 49 ~ Game ~ startRounds ~ currentCat", currentCat);
        let currentGate = this.game.children(`.game__paw--${currentCat}`);
        currentGate.css("--timeout",`${TIMEOUT / 1000}s`);
        currentGate.removeClass("display-none");
        currentGate.addClass("paw-animation");
        
        setTimeout(() => currentSpeechBox.addClass("display-none"), TIMEOUT - 500);
        setTimeout(()=> {
            currentGate.removeClass("paw-animation");
            currentGate.addClass("display-none");
        }, TIMEOUT);
        // console.log('after cat-1  ',this.gates[0]);
        // console.log('after cat-2  ',this.gates[1]);
        // this.game.click(this.moveBall.bind(this));
        // this.game.click(this.moveBall.bind(this));

        // this.game.click(this.moveBall.bind(this, currentCat));
        // console.log("🚀 ~ file: cat-game.js ~ line 63 ~ Game ~ startRounds ~ currentGate", currentGate)
        // console.log("🚀 ~ file: cat-game.js ~ line 83 ~ Game ~ startRounds ~ this.moveBall.bind(this)", this.moveBall.bind(this));
    }
    moveBall (e,currentCat) {
        let xStart = this.ball[0].getBoundingClientRect().left;
        let yStart = this.ball[0].getBoundingClientRect().top;
        // let degEnd = Math.round(360 * Math.random());
        // this.ball.css({"--xStart":`${xStart}px`,"--yStart":`${yStart}px`,"--xEnd":`calc(${xEnd}px - 10vmin`,"--yEnd":`calc(${yEnd}px - 5vmin`,"--degEnd":`${degEnd}deg`});
        this.ball.css({"--xEnd":`calc(${e.clientX}px - 10vmin`,
                        "--yEnd":`calc(${e.clientY}px - 5vmin`,
                        "--degEnd":`${Math.round(360 * Math.random())}deg`,
                        "--move-time":`${MOVETIME / 1000}s`});
        this.ball.addClass("ball-move");
        console.log(e.target);
        console.log(currentCat);
        console.log(e.clientX);
        console.log(xStart);
        console.log(yStart);
        console.log(e.clientY);
        // return $(e.target);
    }
    createEvents () {
        this.gates.addClass("display-none");
        this.ball.one("click", this.startGame.bind(this));
        this.game.click(this.moveBall.bind(this));

        // this.game.click(this.startRounds);
        // this.game.on("click",this.startRounds);

    }
}
let game = new Game ("#game");