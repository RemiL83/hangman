//#region 
import * as readlinePromises from 'node:readline/promises';
import fs from "node:fs"
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });
//#endregion

import { HANGMAN_UI } from './graphics.mjs';
import { GREEN, RED, WHITE, RESET } from './colors.mjs';
import dictionary from './dictionary.mjs';
import splash from './splash.mjs';

const word = getRandomWord();
let guessedWord = createGuessList(word.length);
let wrongGuesses = [];
let isGameOver = false;

console.clear();

let language = await chooseLanguage();
print(language.selectedLanguage);
await new Promise(resolve => setTimeout(resolve, 1500));

console.clear();

print(splash, RED);
await new Promise(resolve => setTimeout(resolve, 2000));

console.clear();

const menuChoice = await showMenu(language);
if (menuChoice === '1') {
        updateUI(language);
    } else {
        print(language.exitMessage);
        process.exit();
}

do {

    updateUI();

    let guess = (await rl.question(language.guessPrompt)).toLowerCase();

    if (wrongGuesses.includes(guess) || guessedWord.includes(guess)) {
        continue;
    }

    if (isWordGuessed(word, guess)) {
        print(language.winCelebration, GREEN);
        isGameOver = true;
    } else if (word.includes(guess)) {
        updateGuessedWord(guess);

        if (isWordGuessed(word, guessedWord)) {
            print(language.winCelebration, GREEN);
            isGameOver = true;
        }
    } else {
        wrongGuesses.push(guess);

        if (wrongGuesses.length >= HANGMAN_UI.length - 1 ) {
            updateUI();
            print(language.deathRattle, RED);
            isGameOver = true;
        }
    }
} while (!isGameOver)

await new Promise(resolve => setTimeout(resolve, 2000));

console.clear();

print("\n" + language.correctWord + word, GREEN);
print("\n" + language.wrongGuessAmount + wrongGuesses.length, RED);
print("\n" + language.exitMessage + "\n");

process.exit();

async function chooseLanguage() {

    const availableLanguages = Object.keys(dictionary); 

    let languageCode = (await rl.question(dictionary.languageChoices)).toLowerCase();

    return availableLanguages.includes(languageCode)
        ? dictionary[languageCode]
        : (print(language.notAvailable), dictionary.en)
}

async function showMenu(language) {
    print(language.menuStartGame);
    print(language.menuExit);

    while (true) {
        const choice = await rl.question(language.menuPrompt);
        if (choice === '1' || choice === '2') {
            return choice;
        }
        print(language.invalidMenuChoice);
    }
}

function updateUI() {

    console.clear();

    print(language.currentWord + guessedWord.join(" "), GREEN);
    print(HANGMAN_UI[wrongGuesses.length]);

    if (wrongGuesses.length > 0) {
        print(language.wrongGuesses + RED + wrongGuesses.join(", ") + RESET);
    }
}

function getRandomWord() {

    const words = ["Kiwi", "Car", "Dog", "etwas"];
    let index = Math.floor(Math.random() * words.length); 
    return words[index].toLowerCase();

}

function updateGuessedWord(guess) {
    for (let i = 0; i < word.length; i++) {
        if (word[i] == guess) {
            guessedWord[i] = guess;
        }
    }
}

function createGuessList(length) {
    let output = [];
    for (let i = 0; i < length; i++) {
        output[i] = "_";
    }
    return output;
}

function isWordGuessed(correct, guess) {
    for (let i = 0; i < correct.length; i++) {
        if (correct[i] != guess[i]) {
            return false;
        }
    }

    return true;
}

function print(msg, color = WHITE) {
    console.log(color, msg, RESET);
}