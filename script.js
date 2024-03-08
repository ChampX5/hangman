class Letter {
    constructor(letter) {
        this.letter = letter;
        this.initElement(letter.toUpperCase());
    }

    initElement(letter) {
        const div = document.createElement('div');
        div.classList.add('letter', `letter-${letter.toLowerCase()}`);

        div.innerHTML = letter;

        this.element = div;
    }

    getElement() {
        return this.element;
    }
}

class Game {
    constructor() {
        this.reset();
    }

    reset() {
        this.letters = [];

        this.currentWord = [];

        this.wrongAttempts = -1;
        this.attempts = "HANGMAN";
        this.currentAttempts = "";
        this.currentAttemptLetters = [];

        this.placeholderChar = '#';

        this.setup();
        this.initGame().then(() => {
            this.renderWord();
            this.renderAttempts();
        });
    }

    async initGame() {
        this.word = await this.getWord();

        for (let i = 0; i < this.word.length; i++) {
            this.currentWord.push(this.placeholderChar);
        }
    }

    setup() {
        const letterCodes = Array.from(Array(26)).map(
            (_, idx) => idx + 65
        );

        const letters = [];

        const lettersArray = letterCodes.map(val => String.fromCharCode(val));

        for (const letterUppercase of lettersArray) {
            const letter = new Letter(letterUppercase.toLowerCase());
            letters.push(letter);
        }

        for (const letter of letters) {
            const elem = letter.getElement();

            elem.addEventListener('click', () => {
                if (elem.classList.contains('over')) return;

                elem.classList.add('over');

                // logic
                if (this.word.indexOf(letter.letter) > -1) {
                    elem.classList.add('over-green');

                    const indices = [];

                    for (let i = 0; i < this.word.length; i++) {
                        if (this.word[i] === letter.letter) {
                            indices.push(i);
                        }
                    }

                    for (const index of indices) {
                        this.currentWord[index] = letter.letter;
                    }

                    this.updateWord();
                } else {
                    this.wrongAttempts++;
                    this.updateAttempts();

                    elem.classList.add('over-red');
                }
            });
        }

        const letterContainer = document.querySelector('.letters');

        for (const letter of letters) {
            letterContainer.appendChild(letter.getElement());
        }
    }

    renderWord() {
        const wordContainer = document.querySelector('.word');

        for (let i = 0; i < this.word.length; i++) {
            const div = document.createElement('div');

            div.classList.add('word-letter', 'not-discovered');
            div.style.setProperty('--letter', `"${this.word[i].toUpperCase()}"`);

            wordContainer.appendChild(div);

            this.letters.push(div);
        }
    }

    renderAttempts() {
        const attemptsContainer = document.querySelector('.attempts');

        for (let i = 0; i < this.attempts.length; i++) {
            const div = document.createElement('div');

            div.classList.add('attempts-letter', 'not-discovered');
            div.style.setProperty('--letter', `"${this.attempts[i].toUpperCase()}"`);

            this.currentAttemptLetters.push(div);

            attemptsContainer.appendChild(div);
        }
    }

    updateWord() {
        for (let i = 0; i < this.word.length; i++) {
            if (this.currentWord[i] === this.word[i]) {
                if (this.letters[i].classList.contains('discovered')) continue;

                this.letters[i].classList.toggle('not-discovered');
                this.letters[i].classList.toggle('discovered');
            } else continue;
        }
    }

    updateAttempts() {
        this.currentAttempts = `${this.currentAttempts}${this.attempts[this.wrongAttempts]}`

        this.currentAttemptLetters[this.wrongAttempts].classList.toggle('not-discovered');
        this.currentAttemptLetters[this.wrongAttempts].classList.toggle('discovered');

        if (this.currentAttempts === this.attempts) {
            this.lose();
        }
    }

    lose() {
        const wordContainer = document.querySelector('.word');
        const letterContainer = document.querySelector('.letters');
        const attemptsContainer = document.querySelector('.attempts');

        wordContainer.animate({
            opacity: 0,
            pointerEvents: 'none'
        }, {
            duration: 1500,
            fill: 'forwards',
            easing: 'ease-in-out'
        });

        letterContainer.animate({
            opacity: 0,
            pointerEvents: 'none'
        }, {
            duration: 1500,
            fill: 'forwards',
            easing: 'ease-in-out'
        });

        attemptsContainer.animate({
            translate: "0 -300px",
            gap: "0px"
        }, {
            delay: 1500,
            duration: 750,
            fill: 'forwards',
            easing: 'ease-in-out'
        });

        const reset = document.createElement('div');
        reset.innerHTML = 'You lose! <u>RELOAD</u> the page to play again!'

        reset.style.opacity = 0;
        reset.style.textTransform = "uppercase";
        reset.style.textAlign = "center";
        reset.style.color = "white";
        reset.style.position = "absolute";
        reset.style.top = "50%";
        reset.style.left = "50%";
        reset.style.translate = "-50% calc(-50% - 100px)";

        document.body.appendChild(reset);

        reset.animate({
            opacity: 1,
            translate: "-50% calc(-50% - 75px)"
        }, {
            delay: 2250,
            duration: 300,
            fill: 'forwards',
            easing: 'ease-in-out'
        })
    }

    async getWord() {
        const length = Math.floor(Math.random() * 6) + 4;

        const res = await fetch(`https://random-word-api.herokuapp.com/word?lang=en&length=${length}`);
        const words = await res.json();

        return words[0];
    }
}

const game = new Game();
