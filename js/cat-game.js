const MESSAGES = [
    "Подать мне клубок!",
    "Клубок в мои лапы!",
    "Мне нужен клубок!",
    "Клубочек...",
    "Мне клубочек",
    ["Мне клубочек", "Еще раз мне"],
    "Ловлю!",
    "Моя очередь"
];
const WIN = 5;
const TIMEOUT = 2000;

let currentCat = Math.floor(Math.random() * 2 + 1);
console.log("🚀 ~ file: cat-game.js ~ line 11 ~ currentCat", currentCat);
let speech = Math.round((MESSAGES.length - 0) * Math.random());
console.log("🚀 ~ file: cat-game.js ~ line 13 ~ speech", speech)