import { Button } from './button.js';

interface PlayerView {
    numberOfCards: number;
    isAttacking: boolean;
}

enum Rank {
    Six = 6, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace
}

enum Suit {
    Club, Diamonds, Heart, Spade
}

enum State {
    Menu, CreateGame, PlayerSetup, GameTable
}

export interface Card {
    rank: Rank;
    suit: Suit;
}

interface GameViewInfo {
    playerID: number;

    attackingPlayer: number;
    defendingPlayer: number;
    playerTurn: number;

    deckSize: number;
    discardHeapSize: number;
    discardHeapChanged: boolean;

    durak: number;

    hand: Card[];

    playersView: PlayerView[];
    trumpCard: Card;

    attackingCards: Card[];
    defendingCards: Card[];

    takingCards: boolean;
}

class MousePos {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class GameView {
    private canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    private cardWidth: number;
    private cardHeight: number;
    private cardCorner: number;

    private mouseClickMargin: number = 7;

    private cardLowerY: number;
    private cardUpperY: number;

    private cardLeftX: number;
    private cardMiddleX: number;
    private cardRightX: number;

    private deckPosX: number;
    private deckPosY: number;

    private modeHeight: number;

    private offset: number;

    private cardDir: string = "images/deck/";
    private modesDir: string = "images/modes/";

    private backCard: string = "2B";

    private images = new Map();
    private boutCardPositions = new Map();
    private modesPositions = new Map();
    private discardedPilePositions = new Map();

    public textUpperMargin: number;
    public textLeftMargin: number;

    public boxHeight: number;
    private totalCardWidth: number;

    private mousePos: MousePos;
    private gameView: GameViewInfo;

    private id: number;
    private totalPlayers: number;

    private userName: string = "";
    private input: HTMLInputElement;
    private nTextMetrics: TextMetrics;
    private socket: WebSocket;
    private state: State;

    private button: Button;
    private buttonMenu: Button;
    private joinButton: Button;
    private createButton: Button;

    public fontSize: number = 20;
    private hasInput: boolean = false;
    // setting is the first mode of each row
    private selectedModes: number[] = [0, 0, 0];

    public positionsAroundTable: { x: number, y: number, tWidth: number; }[];
    private positionsAroundTableDuplicate: { x: number, y: number, tWidth: number; }[];

    constructor(socket?: WebSocket) {
        this.state = State.Menu;

        this.socket = socket;

        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        this.windowObjectsResize(canvas, context);

        this.mousePos = new MousePos(0, 0);

        this.setBoutPositions();
        this.setModesPositions();

        this.canvas.addEventListener("click", (e) => {
            this.mousePos.x = e.x;
            this.mousePos.y = e.y;
            console.log("The mouse click at : " + this.mousePos.x + " " + this.mousePos.y);

            this.CheckMouseClick();
        });

        window.addEventListener("resize", () =>
            this.reportWindowResize(this.canvas, this.context));
    }

    public setConnectionFields(gameView: GameViewInfo, id: number, players: number) {
        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;
    }

    private setBoutPositions(): void {
        this.boutCardPositions.set(
            1, [{
                x: this.cardMiddleX - this.cardWidth / 2,
                y: this.deckPosY
            }]);

        this.boutCardPositions.set(
            2, [
            { x: this.cardMiddleX - this.cardWidth - this.cardWidth / 2, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth - this.cardWidth / 2, y: this.deckPosY }
        ]);

        this.boutCardPositions.set(
            3, [
            {
                x: this.cardMiddleX - 2 * this.cardWidth - this.cardWidth / 2,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX - this.cardWidth / 2,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX + this.cardWidth + this.cardWidth / 2,
                y: this.deckPosY
            }
        ]);

        this.boutCardPositions.set(
            4, [
            { x: this.cardMiddleX - 3 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX - this.cardWidth - this.cardWidth / 2, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth / 2, y: this.deckPosY },
            { x: this.cardMiddleX + 2 * this.cardWidth, y: this.deckPosY }
        ]);
    }

    private setModesPositions(): void {
        this.modesPositions.set(1, {
            x: this.canvas.width / 2 - this.modeHeight / 2 - this.modeHeight,
            y: this.canvas.height / 2 - this.modeHeight - this.modeHeight / 2
        });

        this.modesPositions.set(2, {
            x: this.canvas.width / 2 + this.modeHeight / 2,
            y: this.canvas.height / 2 - this.modeHeight - this.modeHeight / 2
        });

        this.modesPositions.set(3, {
            x: this.canvas.width / 2 - this.modeHeight / 2,
            y: this.canvas.height / 2 + this.modeHeight / 4 - this.modeHeight / 2
        });

        this.modesPositions.set(4, {
            x: this.canvas.width / 2 - this.modeHeight / 2 - this.modeHeight - this.modeHeight,
            y: this.canvas.height / 2 + this.modeHeight / 2 + this.modeHeight - this.modeHeight / 2
        });

        this.modesPositions.set(5, {
            x: this.canvas.width / 2 - this.modeHeight / 2,
            y: this.canvas.height / 2 + this.modeHeight / 2 + this.modeHeight - this.modeHeight / 2
        });

        this.modesPositions.set(6, {
            x: this.canvas.width / 2 + this.modeHeight / 2 + this.modeHeight,
            y: this.canvas.height / 2 + this.modeHeight / 2 + this.modeHeight - this.modeHeight / 2
        })
    }

    private reportWindowResize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        this.windowObjectsResize(canvas, context);
        switch (this.state) {
            case State.Menu:
                this.displayMenu();
                break;
            case State.CreateGame:
                this.LoadGameSettingMenu();
                break;
            case State.GameTable:
                this.displayStateOfTheGame();
                break;
            case State.PlayerSetup:
                this.displayPlayerSetupPage();
                break;
        }
    }

    private setFontSize(size?: number): void {
        if (typeof size !== undefined) {
            switch (this.state) {
                case State.Menu:
                    this.fontSize = 50;
                    break;
                case State.GameTable:
                    this.fontSize = 20;
                    break;
                case State.CreateGame:
                    this.fontSize = 30;
                    break;
                case State.PlayerSetup:
                    this.fontSize = 30;
                    break;
            }
        } else {
            this.fontSize = size;
        }

        this.context.lineWidth = 5;
        this.context.font = "bold " + this.fontSize + "px Serif";
        this.boxHeight = this.fontSize + this.textUpperMargin;
    }

    private windowObjectsResize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        console.log("WINDOW CHANGES");

        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;

        console.log(canvas.width);
        console.log(canvas.height);

        this.canvas = canvas;
        this.context = context;

        this.textUpperMargin = 20;
        this.textLeftMargin = this.canvas.width / 251;

        this.setFontSize();

        this.cardWidth = 117;
        this.cardHeight = 140;

        this.modeHeight = this.canvas.height / 7;

        this.cardCorner = this.cardWidth / 4;

        this.cardMiddleX = this.canvas.width / 2;
        this.cardLeftX = this.canvas.width / 7;
        this.cardRightX = this.canvas.width / 7 * 6;

        this.cardUpperY = this.canvas.height / 40;
        this.cardLowerY = this.canvas.height - this.cardHeight - this.cardUpperY - this.boxHeight;

        this.deckPosX = this.canvas.width / 10 * 0.5;
        this.deckPosY = this.canvas.height / 2 - 90;

        this.offset = this.cardHeight + 30;

        this.positionsAroundTable = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ];

        this.positionsAroundTableDuplicate = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ];

        this.setBoutPositions();
        this.setModesPositions();
    }

    private isDefending(): boolean {
        return this.gameView.defendingPlayer == this.id;
    }

    private isAttacking(): boolean {
        return this.gameView.attackingPlayer == this.id;
    }

    public drawBox(text: string, x: number, y: number, strokeStyle: string,
        textStyle: string, withRectangle: boolean, fontS: number) {

        this.context.save();
        this.context.font = "bold " + fontS + "px serif";

        this.context.fillStyle = textStyle;
        this.context.strokeStyle = strokeStyle;

        if (withRectangle) {
            let textM: TextMetrics = this.context.measureText(text);

            x = x - textM.width / 2;

            this.context.fillText(text, x, y);
            this.context.strokeRect(x - this.textLeftMargin,
                y - fontS, textM.width + 2 * this.textLeftMargin,
                this.textUpperMargin + fontS);
        }
        else {
            this.nTextMetrics = this.context.measureText(text);
            this.context.fillText(text, x - this.nTextMetrics.width / 2, y);
        }
        this.context.restore();
    }

    /*
        Returns the index of the selected card position
    */
    private GetCardSelected(): number {
        let x: number = this.positionsAroundTable[0].x;

        return (this.mousePos.x - x - this.mouseClickMargin) / this.cardCorner;
    }

    /*
        Check if the mouse click is within the main players hand
    */
    private isCardSelected(): boolean {
        let x: number = this.positionsAroundTable[0].x;
        let y: number = this.positionsAroundTable[0].y;
        let w: number = this.positionsAroundTable[0].tWidth;

        return x + this.mouseClickMargin < this.mousePos.x &&
            this.mousePos.x <= x + w + this.mouseClickMargin &&
            y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
    }

    private isButtonSelected(): boolean {
        return this.button.contains(this.mousePos);
    }

    private isJoinPressed(): boolean {
        return this.joinButton.contains(this.mousePos);
    }

    private isCreatePressed(): boolean {
        return this.createButton.contains(this.mousePos);
    }

    private isBackToMenuPressed(): boolean {
        return this.buttonMenu.contains(this.mousePos);
    }

    /*
        Returns an image for a given card.
    */
    public getImage(card?: Card, isCard?: boolean, name?: string): HTMLImageElement {
        let strImg: string;
        if (isCard) {
            if (card) {
                let strRank: string = this.fromIntToRank(card.rank);
                let strSuit: string = this.fromIntToSuit(card.suit);
                strImg = strRank.concat(strSuit);
            } else {
                strImg = this.backCard;
            }
        } else {
            strImg = name;
        }

        if (this.images.has(strImg)) {
            return this.images.get(strImg);
        }
        else {
            let img = new Image();
            img.onload = () => isCard ? this.displayStateOfTheGame() : this.LoadGameSettingMenu();
            img.src = (isCard ? this.cardDir : this.modesDir).concat(strImg.concat(".png"));

            this.images.set(strImg, img);
            return img;
        }
    }

    private displayModeImages(): void {
        let img: HTMLImageElement;
        let pos: { x: number, y: number; };

        for (let i: number = 1; i <= 6; i++) {
            pos = this.modesPositions.get(i);
            img = this.getImage(undefined, false, i.toString());

            this.context.drawImage(img, pos.x, pos.y, this.cardHeight, this.cardHeight);
        }
    }

    /*
        Outlines the modes based on the modes selected 
    */
    private outlineSelectedModes(): void {
        let modeOfTheRow: number;
        let pos: { x: number, y: number; };
        this.context.save();
        this.context.strokeStyle = 'lime';

        for (let i: number = 0; i < this.selectedModes.length; i++) {
            modeOfTheRow = this.selectedModes[i] + 1;
            if (i == 1) {
                modeOfTheRow += 2;
            } else if (i == 2) {
                modeOfTheRow += 3;
            }
            pos = this.modesPositions.get(modeOfTheRow);
            this.context.strokeRect(pos.x, pos.y, this.cardHeight, this.cardHeight);
        }
        this.context.restore();
    }

    /*
        Displays the main text in the middle of the screen. Also underlines the text 
    */
    private writeMainTextWithUnderlying(text: string): void {
        let textM: TextMetrics = this.context.measureText(text);
        // write text
        this.drawBox(text, this.canvas.width / 2, this.deckPosY - this.canvas.height / 4, 'black',
            'black', false, 80
        );

        console.log(this.fontSize);

        // make a line under MENU
        this.context.beginPath();
        this.context.moveTo(this.canvas.width / 2 - textM.width / 2 -
            textM.width % 10, this.deckPosY - this.canvas.height / 4 +
        this.textUpperMargin);
        this.context.lineTo(this.canvas.width / 2 + textM.width / 2 +
            textM.width % 10, this.deckPosY - this.canvas.height / 4 +
        this.textUpperMargin);
        this.context.stroke();
    }

    /*
        Loads the Setting Menu screen with all the game modes  
    */
    private LoadGameSettingMenu(): void {
        // redraw the screen
        this.drawScreen('lavender', 'black');

        // display "Choose Modes" text
        this.writeMainTextWithUnderlying("Choose Modes");

        // display the setting of the game
        this.displayModeImages();

        this.context.save();
        this.setFontSize(30)
        // create a back to Menu button
        this.buttonMenu = new Button(this, 50 + 2 * this.textLeftMargin, 50, "Menu", this.fontSize);
        this.buttonMenu.draw('black', 'black');

        // create a Proceed button
        let tM: TextMetrics = this.context.measureText("Proceed");
        this.button = new Button(this, this.canvas.width - tM.width / 2 - 4 * this.textLeftMargin,
            this.canvas.height - this.boxHeight, "Proceed", this.fontSize);
        this.button.draw('black', 'black');


        // Create outline of modes selected on each row
        this.outlineSelectedModes();

        this.context.restore();

    }

    /*
        Checks if given mode pressed
    */
    private isModePressed(pos: { x: number, y: number; }): boolean {
        return pos.x < this.mousePos.x && this.mousePos.x <= pos.x + this.cardHeight &&
               pos.y < this.mousePos.y && this.mousePos.y <= pos.y + this.cardHeight;
    }

    /*
        Checks if any of the mode was pressed 
    */
    private anyModePressed(): boolean {
        for (let i: number = 1; i <= 6; i++) {
            if (this.isModePressed(this.modesPositions.get(i))) {
                if (i == 1 || i == 2) {
                    this.selectedModes[0] = i - 1;
                } else if (3 < i && i < 7) {
                    i -= 4;
                    this.selectedModes[2] = i;
                }
                return true;
            }
        }
        return false;
    }

    //Function to dynamically add an this.this.input box: 
    private addInput(x: number, y: number) {
        if (this.hasInput) {
            document.body.removeChild(this.input);
        }
        this.input = document.createElement('input');
        this.input.value = this.userName;
        this.input.type = 'text';
        this.input.style.position = 'fixed';
        this.input.style.left = x + 'px';
        this.input.style.top = y + 'px';
        this.input.required;
        this.input.maxLength = 15;
        this.input.style.width = 180 + 'px';
        this.input.style.height = 33 + 'px';
        this.input.style.fontSize = 22 + 'px';
        this.input.style.fontFamily = 'Serif';
        this.input.onkeydown = (e) => {
            if (e.keyCode === 13) {
                this.userName = this.input.value.trim();
                console.log("User entered the following username: " + this.userName);
            }
        };
        this.hasInput = true;
        document.body.appendChild(this.input);
        this.input.focus();
    }

    /*
        Displays the setup page where the user can select icon and write the name 
    */
    private displayPlayerSetupPage(): void {
        // redraw the screen
        this.drawScreen('lavender', 'black');

        // display the main text "Player Setup"
        this.writeMainTextWithUnderlying("Player Setup");

        // display form for name this.input
        let textMetric: TextMetrics = this.context.measureText("Name: ");
        this.context.fillText("Name: ", this.canvas.width / 2 - 2 * textMetric.width,
            this.canvas.height / 2 - this.canvas.height / 5);
        // add input element
        this.addInput(this.canvas.width / 2, this.canvas.height / 2 - this.canvas.height / 5);
        // create the options for icon selections
        textMetric = this.context.measureText("Select an Icon");
        this.context.fillText("Select an Icon", this.canvas.width / 2 - textMetric.width / 2,
            this.canvas.height / 2);

        // put the images of icons 
    }

    private changeStates(newState: State) {
        this.state = newState;
        this.setFontSize();
        this.selectedModes = [0, 0, 0];
    }

    /*
        Function that tells which card the attacking player has selected to attack 
    */
    private CheckMouseClick(): void {
        let strJSON: string;
        if (this.state == State.GameTable && (this.isAttacking() || this.isDefending())) {
            if (this.isCardSelected()) {
                let cardIndex: number = Math.floor(this.GetCardSelected());

                if (cardIndex >= this.gameView.hand.length) {
                    cardIndex = this.gameView.hand.length - 1;
                }

                console.log("Card Index clicked is " + cardIndex);

                strJSON = JSON.stringify({
                    Message: this.isAttacking() ? "Attacking" : "Defending",
                    Card: cardIndex
                });

            }
            else if (this.isButtonSelected() && this.gameView.attackingCards.length > 0) {
                console.log("SELECTED");
                strJSON = JSON.stringify({
                    Message: this.isAttacking() ? "Done" : "Take"
                });
            } else {
                return;
            }
            this.socket.send(strJSON);
            console.log(strJSON);
            return;
        }
        else if (this.state == State.Menu) {

            if (this.isJoinPressed()) {
                console.log("JOIN PRESSED");

            }
            else if (this.isCreatePressed()) {
                console.log("CREATE PRESSED");
                this.state = State.CreateGame;
                this.setFontSize();
                this.LoadGameSettingMenu();
            }
            else {
                console.log("SOMETHING ELSE WAS PRESSED");
                return;
            }
        }
        else if (this.state == State.CreateGame) {
            if (this.isBackToMenuPressed()) {
                this.changeStates(State.Menu);
                this.displayMenu();
            }
            else if (this.anyModePressed()) {

                this.LoadGameSettingMenu();

            }
            // Check if the "Proceed" Button was pressed 
            else if (this.isButtonSelected()) {
                this.changeStates(State.PlayerSetup);
                this.displayPlayerSetupPage();
            }
        }
        else if (this.state == State.PlayerSetup) {
            console.log("PLAYER SETUP PAGE");
        }
    }


    private displayBoutHelper(pos: { x: number, y: number; }[], yOffset: number, from: number,
        toAttacking: number, toDefending: number): void {

        for (let i = from; i < toAttacking; i++) {
            let img: HTMLImageElement = this.getImage(this.gameView.attackingCards[i]);

            this.context.drawImage(img, pos[i % 4].x, pos[i % 4].y - yOffset, this.cardWidth, this.cardHeight);
        }

        for (let i = from; i < toDefending; i++) {
            let img: HTMLImageElement = this.getImage(this.gameView.defendingCards[i]);

            this.context.drawImage(img, pos[i % 4].x + 20, pos[i % 4].y - yOffset, this.cardWidth, this.cardHeight);
        }
    }

    /*
        Display attacking and defending cards in the middle of the table 
    */
    public displayBout(): void {
        let pos: { x: number, y: number; }[];
        let attackingCardSize: number = this.gameView.attackingCards.length;
        let defendingCardSize: number = this.gameView.defendingCards.length;

        let count: number = Math.floor(attackingCardSize / 4);
        let from: number = -4;
        let toAttacking: number = 0;
        let toDefending: number = 0;

        while (count > 0) {
            from = from + 4;
            toAttacking = toAttacking + 4;
            toDefending = toDefending + 4 - (attackingCardSize - defendingCardSize);
            pos = this.boutCardPositions.get(4);
            this.displayBoutHelper(pos, count * 25, from, toAttacking, toDefending);
            count = count - 1;
        }

        from = from + 4;
        toAttacking = toAttacking + attackingCardSize % 4;
        toDefending = toDefending + defendingCardSize % 4;

        pos = this.boutCardPositions.get(attackingCardSize % 4);
        this.displayBoutHelper(pos, 0, from, toAttacking, toDefending);
    }

    /*
        Display Discarded Heap 
    */
    public displayDiscardedHeap(): void {
        for (let i = 0; i < this.gameView.discardHeapSize; i++) {
            let coordinates: { angle: number, y: number; };
            let img: HTMLImageElement = this.getImage();

            this.context.save();
            this.context.translate(this.cardRightX + this.cardWidth,
                this.deckPosY + this.cardHeight / 2);

            // getting random angle and y position to replicate the real world discarded pile
            let angle: number = Math.random() * Math.PI * 2;
            let yPos: number = Math.random() * (this.deckPosY + 50 -
                this.deckPosY - 50) + this.deckPosY - 50;

            if (this.discardedPilePositions.get(i)) {
                coordinates = this.discardedPilePositions.get(i);

                this.context.rotate(coordinates.angle);
            } else {
                this.discardedPilePositions.set(i, { angle, yPos });

                this.context.rotate(angle);
            }

            this.context.translate(-this.cardRightX, -this.deckPosY - this.cardHeight / 2);

            this.context.drawImage(img, this.cardRightX, yPos,
                this.cardWidth, this.cardHeight);

            this.context.restore();
        }
    }

    /*
        Dispaly the Suit of the Trump card when there is no deck  
    */
    public displayTrumpSuit(): void {
        let img: HTMLImageElement = this.getImage(this.gameView.trumpCard);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY,
            this.cardWidth, this.cardHeight);
    }

    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck 
    */
    public displayDeck(): void {
        let img: HTMLImageElement = this.getImage(this.gameView.trumpCard);
        this.context.save();

        this.context.translate(this.deckPosX + this.cardWidth + this.cardWidth / 2,
            this.deckPosY + this.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.deckPosX - this.cardWidth / 2,
            -this.deckPosY - this.cardHeight / 2);
        this.context.drawImage(img, this.deckPosX, this.deckPosY,
            this.cardWidth, this.cardHeight);

        this.context.restore();

        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.getImage();
            this.context.drawImage(
                img, this.deckPosX + i + this.cardWidth * 1 / 150, this.deckPosY,
                this.cardWidth, this.cardHeight
            );
        }
    }

    /*
        Returns the string from number that represents the 
        rank of the card
    */
    public fromIntToRank(enumRank: number): string {
        if (4 < enumRank && enumRank < 10) {
            return enumRank.toString();
        }

        return "TJQKA"[enumRank - 10];

    }
    /*
        Returns the string from number that represents the
        suit of the card
    */
    public fromIntToSuit(enumSuit: number): string {
        return "CDHS"[enumSuit];
    }

    /*
        displays the cards from the gameView object 
    */
    private displayMainPlayersHand(hand: Card[], x: number, y: number, tWidth: number) {
        if (hand.length != 0) {
            for (let i = 0; i < hand.length; i++) {
                let img: HTMLImageElement = this.getImage(hand[i]);
                this.context.drawImage(
                    img, x + i * this.cardCorner, y, this.cardWidth,
                    this.cardHeight
                );
            }
        } else {
            this.drawBox("Winner", x + tWidth / 2, y, 'white', 'white', true, this.fontSize);
        }
    }

    /*
        Displays the face down cards of opponents
    */
    private displayFaceDownCards(playerView: PlayerView, x: number, y: number, tWidth: number) {
        if (playerView.numberOfCards != 0) {
            for (let i = 0; i < playerView.numberOfCards; i++) {
                let img: HTMLImageElement = this.getImage();
                this.context.drawImage(
                    img, x + i * this.cardCorner, y, this.cardWidth,
                    this.cardHeight
                );
            }
        } else {
            this.drawBox("Winner", x + tWidth / 2, y, 'white', 'white', true, this.fontSize);
        }
    }

    private IsEndGame(): boolean {
        return this.gameView.attackingPlayer == this.gameView.defendingPlayer;
    }

    /*
        Draws an arrow to indicate which players turn it is to play a card 
        source: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
    */
    private drawArrow(fromX: number, fromY: number, toX: number, toY: number, style: string): void {
        let headlen: number = 10; // length of head in pixels
        let dx: number = toX - fromX;
        let dy: number = toY - fromY;
        let angle: number = Math.atan2(dy, dx);

        this.context.save();
        this.context.strokeStyle = style;

        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(fromX, fromY);
        this.context.lineTo(toX, toY);
        this.context.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen *
            Math.sin(angle - Math.PI / 6));
        this.context.moveTo(toX, toY);
        this.context.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen *
            Math.sin(angle + Math.PI / 6));
        this.context.stroke();
        this.context.restore();
    }

    private displayPlayerOptions(textStr: string, buttonStr: string, pos: {
        x: number, y: number, tWidth: number }): void {

        this.drawBox(textStr, pos.x + pos.tWidth + this.cardWidth,
            pos.y + this.offset, 'white', 'white', false, this.fontSize);

        this.button = new Button(this, pos.x + pos.tWidth + this.cardWidth +
            this.nTextMetrics.width / 2 + 8 * this.textLeftMargin,
            pos.y + this.offset, buttonStr, this.fontSize
        );
        this.button.draw('white', 'white');
    }

    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    public displayPlayersHelper(currentID: number, index: number, position: number[]) {
        let pos: { x: number, y: number, tWidth: number; } =
            this.positionsAroundTable[position[index] - 1];

        if (currentID == this.gameView.attackingPlayer) {
            this.context.strokeStyle = 'lime';
        } else if (currentID == this.gameView.defendingPlayer) {
            this.context.strokeStyle = 'red';
        } else {
            this.context.strokeStyle = 'black';
        }

        // Add an arrow indicating whose turn it is to play
        if (currentID == this.gameView.playerTurn) {
            this.drawArrow(pos.x, pos.y + this.offset, pos.x + pos.tWidth / 4, pos.y + this.offset,
                'white');
        }

        this.drawBox("Player " + currentID, pos.x + pos.tWidth / 2,
            pos.y + this.offset, this.context.strokeStyle, 'white', true, this.fontSize);


        if (this.id == currentID) {
            this.displayMainPlayersHand(this.gameView.hand, pos.x, pos.y, pos.tWidth);

            if (this.isAttacking()) {
                // display "Attack" message if no cards were played 
                if (this.gameView.attackingCards.length == 0) {
                    this.drawBox("Attack", pos.x + pos.tWidth + this.cardWidth,
                        pos.y + this.offset, 'white', 'white', false, this.fontSize);
                }
                // display "Done" button on the attacking player if attack successfully defeated or
                // if defending player took cards 
                else if (this.gameView.attackingCards.length == this.gameView.defendingCards.length
                    || this.gameView.takingCards) {
                    // display message "Add Cards" if the player took cards
                    if (this.gameView.takingCards) {
                        this.displayPlayerOptions("Add Cards", "Done", pos);
                    }
                    // display message "Continue Attack" if the player defended successfully
                    else {
                        this.displayPlayerOptions("Continue Attack", "Done", pos);
                    }
                }
            }

            // display "Take" button on the defending player if cannot defend / just want to
            if (this.isDefending() && this.gameView.attackingCards.length >
                this.gameView.defendingCards.length && !this.gameView.takingCards) {

                this.displayPlayerOptions("Defend", "Take", pos);
            }
        } else {
            this.displayFaceDownCards(this.gameView.playersView[currentID], pos.x, pos.y, pos.tWidth);
        }

        if (this.IsEndGame()) {
            this.drawBox("Durak is " + this.gameView.durak, innerWidth / 2 - 50,
                this.deckPosY, 'white', 'white', true, this.fontSize);
        }

    }

    /*
        Returns the position of players depending on the
        size of players playing
    */
    private getPositions(totalPlayers: number): number[] {
        switch (totalPlayers) {
            case 2:
                return [1, 4];
            case 3:
                return [1, 3, 5];
            case 4:
                return [1, 3, 4, 5];
            case 5:
                return [1, 2, 3, 5, 6];
            case 6:
                return [1, 2, 3, 4, 5, 6];
        }
    }

    /*
        Displays Players arounds the table 
    */
    public displayPlayers(): void {
        this.context.fillStyle = 'white';

        let position: number[] = this.getPositions(this.totalPlayers);
        let currentID: number;

        for (let i = 0; i < this.totalPlayers; i++) {
            currentID = (this.id + i) % this.totalPlayers;

            // calculate the total width of cards 
            this.totalCardWidth = (this.gameView.playersView[currentID].numberOfCards - 1) *
                this.cardCorner + this.cardWidth;
            // subtract from given x point in the window the half of the width of cards
            this.positionsAroundTable[position[i] - 1].x =
                this.positionsAroundTableDuplicate[position[i] - 1].x - this.totalCardWidth / 2;

            this.positionsAroundTable[position[i] - 1].tWidth = this.totalCardWidth;

            this.displayPlayersHelper(currentID, i, position);
        }
    }

    /*
        Stops displaying the table and the current number of
        players joined to the game
    */
    public removeTable() {
        this.canvas.style.display = "none";
    }

    /*
        Displays the table and the current number of
        players joined to the game
    */
    public drawScreen(fillS: string, strokeS: string): void {
        // Draws the empty table
        this.context.save();

        this.context.fillStyle = fillS;
        this.context.strokeStyle = strokeS;
        this.context.lineWidth = 10;

        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
    }

    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    public displayStateOfTheGame(): void {
        this.drawScreen('green', 'black');

        this.displayPlayers();

        if (this.gameView.deckSize == 0) {
            this.displayTrumpSuit();
        } else {
            this.displayDeck();
        }

        if (this.gameView.discardHeapSize != 0 && this.gameView.discardHeapChanged) {
            this.displayDiscardedHeap();
        }

        this.displayBout();
    }

    /*
        Displays the menu section once the players connect 
        Menu section has Join and Create Buttons
    */
    public displayMenu(): void {
        this.drawScreen('Lavender', 'black');

        this.context.save();
        this.writeMainTextWithUnderlying("MENU");

        // create buttons for JOIN and CREATE
        this.joinButton = new Button(this, this.canvas.width / 2,
            this.deckPosY - this.textUpperMargin, "JOIN", this.fontSize);
        this.joinButton.draw('black', 'black');

        this.createButton = new Button(this, this.canvas.width / 2,
            this.deckPosY + this.boxHeight, "CREATE", this.fontSize);
        this.createButton.draw('black', 'black');

        this.context.restore();
    }

    /*
        Display the error if Attack/Defense is illegal
    */
    public displayMessage(type: string): void {
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'white';

        let textStr: string;

        switch (type) {
            case "illegal":
                textStr = "Illegal Card Played";
                break;
            case "wait":
                textStr = this.isAttacking() ? "Wait For The Defending Player" :
                    "Wait For The Attacking Player";
                break;
            case "tookCards":
                textStr = "Cannot Defend. You Decided To Take The Cards";
                break;
            case "takeCards":
                textStr = "Player " + this.gameView.defendingPlayer + " Takes The Cards";
                break;
            default:
                console.log("Unknown type of the string (Check the error types)");
                break;
        }

        this.drawBox(textStr, this.positionsAroundTable[0].x +
            this.positionsAroundTable[0].tWidth / 2, this.deckPosY - 2 * this.textUpperMargin,
            'white', 'white', true, this.fontSize);

        setTimeout(() => this.displayStateOfTheGame(), 3000);
    }
}