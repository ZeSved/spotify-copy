import { API_URL } from "./config.js";

const wordEl = document.querySelector(".word");
const newWordBtn = document.querySelector(".new-word");
const boxEls = document.querySelectorAll(".box");
const winOrLoseEl = document.querySelector(".win-lose");

const guessFormEl = document.querySelector(".guess--form");
const guessInputEl = document.querySelector(".input");

let failCount = 0;

const renderWord = async function () {
  try {
    const response = await fetch(`${API_URL}/word`);
    const data = await response.json();
    const wordLength = await data[0].length;
    wordEl.textContent = Array(wordLength).fill(" _").join("").slice(1);
    console.log(`Word: ${data}`);
    return data;
  } catch (error) {
    console.warn(`ERR: ${error}`);
  }
};

let [word] = await renderWord();

const reset = async function () {
  [word] = await renderWord();
  failCount = 0;
  boxEls.forEach((box) => box.classList.remove("box-checked"));
  guessInputEl.value = "";
  winOrLoseEl.textContent = "";
  guessInputEl.disabled = false;
};

const wonOrLoss = function (state) {
  wordEl.textContent = word;
  winOrLoseEl.textContent = state == "won" ? "You won!" : "You failed, better luck next time!";
  guessInputEl.disabled = true;
  guessInputEl.value = "";

  setTimeout(() => {
    reset();
  }, 3000)
}

const setCharAt = function (str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
};

const handleGuess = async function (ev) {
  ev.preventDefault();

  const guess = guessInputEl.value.toLowerCase();

  // Return if input is > 1 char
  if (guess === word) return wonOrLoss("won");

  // Split the word into an array
  let arr = [];
  for (let i = 0; i < word.length; i++) {
    arr.push(word.charAt(i));
  }

  // Check if guess is wrong
  if (!arr.includes(guess)) {
    // Render failure
    const curFailEl = document.querySelector(`.box${failCount + 1}`);
    curFailEl.classList.add("box-checked");
    failCount++;

    guessInputEl.value = "";
    guessInputEl.focus();

    if (failCount == 10) wonOrLoss("lose")
  }

  // Check if guess is right
  arr.forEach((el, index) => {
    if (el === guess) {
      let curText = wordEl.textContent;

      // Replace the accurate underscore
      curText = setCharAt(curText, index * 2, el);

      // Update the UI
      wordEl.textContent = curText;
      guessInputEl.value = "";
      guessInputEl.focus();

      // Check if they've got the word right
      if (!curText.includes("_")) wonOrLoss("win")
    }
  });
};

const init = function () {
  guessFormEl.addEventListener("submit", (ev) => handleGuess(ev));
  newWordBtn.addEventListener("click", reset);
};

init();
