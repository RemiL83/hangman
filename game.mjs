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

async function chooseLanguage() {

    const availableLanguages = Object.keys(dictionary); 
    const languagePrompt = dictionary.languageChoices;

    let languageCode = await rl.question(languagePrompt);
    languageCode = languageCode.toLowerCase();
 
    if (!availableLanguages.includes(languageCode)) {
        print("Ikke gyldig. Velger norsk.");
        return dictionary.no;
    }

    return dictionary[languageCode];
}

function uppdateGuessedWord(guess) {
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

function updateUI() {

    console.clear();
    print(language.currentWord + guessedWord.join(" "), GREEN);
    print(HANGMAN_UI[wrongGuesses.length]);
    if (wrongGuesses.length > 0) {
        print("\n" + language.wrongGuesses + RED + wrongGuesses.join(", ") + RESET);
    }
}

function getRandomWord() {

    const words = ["Kiwi", "Car", "Dog", "etwas"];
    let index = Math.floor(Math.random() * words.length); //Fjernet -1. Forskjell?
    return words[index].toLowerCase();

}

console.clear();

let language = await chooseLanguage();
print(language.selectedLanguage);
await new Promise(resolve => setTimeout(resolve, 1500));

console.clear();

print(splash, RED);
await new Promise(resolve => setTimeout(resolve, 3000));

console.clear();

const menuChoice = await showMenu(language);
if (menuChoice === '1') {
        updateUI(language);
    } else {
        print(language.exitMessage);
        process.exit();
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

do {

    updateUI();

    let guess = (await rl.question(language.guessPrompt)).toLowerCase();

    if (isWordGuessed(word, guess)) {
        print(language.winCelebration, GREEN);
        isGameOver = true;
    }
    else if (word.includes(guess)) {

        uppdateGuessedWord(guess);

        if (isWordGuessed(word, guessedWord)) {
            print(language.winCelebration, GREEN);
            isGameOver = true;
        }
    } else {
        wrongGuesses.push(guess);

        if (wrongGuesses.length >= HANGMAN_UI.length - 1) {
            isGameOver = true;
            print(language.deathRattle, RED);
        }

    }

} while (isGameOver == false)

process.exit();

