"use strict";

// Różne stałe przydatne później
const UP = "ArrowUp";
const DOWN = "ArrowDown";
const ENTER = "Enter";

const MENU = "menu";
const GAME = "game";

const SPF = Math.floor(1000 / 60); // miliseconds per frame --- Master race

/**********************************************************************

    "handleScene" to funkcja ogarniająca zmianę sceny. Dopiera scenę 
    w zależności od wartości "state". Dodatkowo ustawia handlery dla 
    danej sceny np. handlery ogarniające naciśnięcie przycisku.

    "init" pobiera 'canvas' z htmla i zapamiętuje go.

***********************************************************************/
const gameState = {
    handlers: {},
    handleScene: function handleScene(state) {

        // Czysczenie poprzednich handlerów
        for (let event of Object.keys(this.handlers)) {
            document.removeEventListener(event, this.handlers[event]);
        }

        switch (state) {
            case MENU:
                this.handlers = menu.init(this.ctx);
                break;

            case GAME:
                this.handlers = game.init(this.ctx);
                break;

            default:
                return console.warn(`Unknown scene "${state}"`);
        }

        // Dodanie nowych handlerów
        for (let event of Object.keys(this.handlers)) {
            document.addEventListener(event, this.handlers[event]);
        }

    },
    init: function init() {
        this.canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");
    }
}

/**********************************************************************

    Scena menu.

    'calculateButtons' oraz 'calculateButtons' obliczają pozycje i
    wielkości przycisków oraz menu na podstawie 'buttons', 'font',
    'ctx', 'buttonBorder' oraz 'menuBorder'. 

    'init' przygotowuje wstępnie scenę oraz zwraca handlery
    kotntrolujące scenę.

    'draw' rysuje scenę na nowo.

    'setSelection' zmienia wybrany przycisk.

    'loop' to pętla główna kontrolująca zachowanie.

***********************************************************************/
const menu = {
    selected: 0,
    menuBorder: 10,
    menuPadding: 20,
    buttonBorder: 10,
    font: "48px serif",
    buttons: [
        {
            text: "Start Game",
            scene: GAME
        },
        {
            text: "Start Game second button",
            scene: GAME
        }
    ],
    buttonsSize: {
        width: 0,
        height: 0
    },
    menuSize: {
        width: 0,
        height: 0,
        x: 10,
        y: 10
    },
    state: {
        buttonPressed: ""
    },
    setInitialVars: function setInitialVars() {
        this.selected = 0;
    },
    calculateButtons: function calculateButtons(ctx) {
        ctx.font = this.font;

        const calulateButton = button => {
            const measure = ctx.measureText(button.text);

            const width = measure.width;

            this.buttonsSize.width = width > this.buttonsSize.width ? width : this.buttonsSize.width;

            const height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + 5;
            this.buttonsSize.height = height > this.buttonsSize.height ? height : this.buttonsSize.height;
        }

        this.calculatedButtons = this.buttons.forEach(calulateButton);
    },
    calculateMenu: function calculateMenu(ctx) {

        const {width, height} = ctx.canvas;

        this.menuSize.width = this.buttonsSize.width + 2 * this.menuPadding + this.buttonBorder * 2;
        this.menuSize.height = (this.buttonsSize.height + this.menuPadding + this.buttonBorder * 2) * this.buttons.length + 2 * this.menuPadding;

        this.menuSize.x = width/2 - this.menuSize.width/2;
        this.menuSize.y = height/2 - this.menuSize.height/2;
    },
    init: function init(ctx) {

        this.setInitialVars();
        this.calculateButtons(ctx);
        this.calculateMenu(ctx);
        this.clear(ctx);
        this.draw(ctx);

        this.loop(ctx);

        return {
            keydown: event => {
                this.state.buttonPressed = event.key;
            },
            keyup: () => {
                this.state.buttonPressed = "";
            }
        }
    },
    loop: function loop(ctx) {

        // Ogarnianie naciskania klawiszy
        switch (this.state.buttonPressed) {
            case UP:
                this.setSelection(1);
                this.draw(ctx);
                this.state.buttonPressed = "";
                break;

            case DOWN:
                this.setSelection(-1);
                this.draw(ctx);
                this.state.buttonPressed = "";
                break;

            case ENTER:
                gameState.handleScene(this.buttons[this.selected].scene);
                this.state.buttonPressed = "";
                break;
        }

        // Kolejny frame
        setTimeout(() => this.loop(ctx), SPF);
    },
    draw: function draw(ctx) {

        const {buttons, menuSize, buttonsSize, menuBorder, buttonBorder} = this;

        const buttonX = menuSize.x + this.menuPadding + menuBorder;
        const buttonYBase = menuSize.y + this.menuPadding + menuBorder;

        const drawMenu = () => {
            // Rysowanie obramowania menu
            ctx.fillStyle = "green";
            ctx.fillRect(menuSize.x, menuSize.y, menuSize.width, menuSize.height);
            ctx.fillStyle = "#33aa33";
            ctx.fillRect(menuSize.x + menuBorder, menuSize.y + menuBorder, menuSize.width - 2 * menuBorder, menuSize.height - 2 * menuBorder);
        }

        const drawButton = (button, index) => {

            const selected = index === this.selected;
            const buttonY = buttonYBase + index * (buttonsSize.height + buttonBorder * 2 + this.menuPadding);

            // Rysowanie pojedynczego przycisku
            ctx.fillStyle = selected ? "red" : "green";
            ctx.fillRect(buttonX - buttonBorder, buttonY - buttonBorder, buttonsSize.width + 2 * buttonBorder, buttonsSize.height + 2 * buttonBorder);
            ctx.fillStyle = selected ? "#aa3333" : "#33aa33";
            ctx.fillRect(buttonX, buttonY, buttonsSize.width, buttonsSize.height);

            // Rysowanie tekstu
            ctx.fillStyle = "black";
            ctx.font = this.font;
            ctx.fillText(button.text, buttonX, buttonY + 3 * buttonBorder + 5);
        };

        drawMenu();
        buttons.forEach(drawButton);
    },
    clear: function clear(ctx) {

        const {width, height} = ctx.canvas;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

    },
    setSelection(change) {

        this.selected += change;

        if (this.selected >= this.buttons.length) {
            this.selected = 0;
        } else if (this.selected < 0) {
            this.selected = this.buttons.length - 1;
        }
    }
}

/**********************************************************************

    Tutaj będzie scena ponga.

    'init' ma wstępnie przygotować scenę oraz zwrócić handlery
    kotntrolujące scenę.

    'loop' ma wykonać animacje oraz odpalić kolejnego frame'a;

***********************************************************************/
const game = {
    init: function init(ctx) {
        alert("Funkcja nie jest skończona!");

        setTimeout(() => gameState.handleScene(MENU), 100) // Powrót do menu
        return {} // Puste handlery, póki co są tutaj żeby funkcja nie
                  // odpaliła pętli gry tj. 'loop'

        this.loop(ctx);
    },
    loop: function loop(ctx) {

        // Najlepiej żeby jakieś obliczenia tego co się zmienia np.
        // że piłka zmienia kierunek, przesunęła się itp. były
        // wykonywane tutaj, a nie w draw()

        draw(ctx)
        setTimeout(() => this.loop(ctx), SPF); // Odpalenie kolejnego frame'a
    },
    draw: function draw() {
        // Rysowanko
    }
}

/**********************************************************************

    Główna funkcja. Przede wszystkim przygotowuje jakieś duperele i
    odpala pierwszą scenę.

***********************************************************************/
function main() {
    gameState.init();
    gameState.handleScene(MENU);
}

/**********************************************************************

    Odpali funkcję fn dopiero wtedy kiedy html się załaduje.
    Chroni to przed wysypaniem się skryptu na samym początku.

***********************************************************************/
function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}    

/* Uruchomienie skryptu */
docReady(main)