
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

export interface Card {
    rank: Rank;
    suit: Suit;
}

interface GameView {
    playerID: number

    attackingPlayer: number;
    defendingPlayer: number;

    deckSize: number;
    discardHeapSize: number;
    discardHeapChanged: boolean;

    hand: Card[];

    playersView: PlayerView[];
    trumpCard: Card;

    attackingCards: Card[];
    defendingCards: Card[];
}

class MousePos {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class View {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private cardWidth: number = 100;
    private cardHeight: number = 120;

    private yourTurnStr: string = "Your Turn";
    private takeStr: string = "Take";
    private doneStr: string = "Done";

    private mouseClickMargin: number = 7

    private cardLowerY: number;
    private cardUpperY: number;

    private cardLeftX: number;
    private cardMiddleX: number;
    private cardRightX: number;

    private deckPosY: number;

    private offset: number;

    private dir: string = "images/deck/";
    private backCard: string = "2B";

    private cardImages = new Map();
    private boutCardPositions = new Map();

    private textUpperMargin: number;
    private textLeftMargin: number;

    private boxHeight: number;
    private isFirst: boolean;
    private totalCardWidth: number;

    private mousePos: MousePos;
    private gameView: GameView;

    private id: number;
    private totalPlayers: number;

    private textMetrics: TextMetrics
    private socket: WebSocket;

    private positionsAroundTable: { x: number, y: number, tWidth: number }[];

    constructor() {
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;

        context.font = "17px serif";

        this.canvas = canvas;
        this.context = context;

        this.cardMiddleX = this.canvas.width / 2 - this.cardWidth / 2;
        this.cardLeftX = 100;
        this.cardRightX = this.canvas.width - 300;

        this.cardLowerY = this.canvas.height - this.cardHeight - 60;
        this.cardUpperY = 40;

        this.deckPosY = this.canvas.height / 2 - 90;

        this.offset = 160;

        this.textUpperMargin = 20;
        this.textLeftMargin = 10;

        this.boxHeight = 30;
        this.isFirst = true;

        this.mousePos = new MousePos(0, 0);

        this.positionsAroundTable = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ]

        this.boutCardPositions.set(
            1, [{
                x: this.cardMiddleX,
                y: this.deckPosY
            }]);

        this.boutCardPositions.set(
            2, [
            { x: this.cardMiddleX - 2 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth, y: this.deckPosY }
        ]);

        this.boutCardPositions.set(
            3, [
            {
                x: this.cardMiddleX - 2 * this.cardWidth - this.cardWidth / 2,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX + this.cardWidth + this.cardWidth / 2,
                y: this.deckPosY
            }
        ]);

        this.boutCardPositions.set(
            4, [
            { x: this.cardMiddleX - 4 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX - 2 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + 2 * this.cardWidth, y: this.deckPosY }
        ]);


        this.canvas.addEventListener("click", (e) => {
            this.mousePos.x = e.x;
            this.mousePos.y = e.y;
            console.log("The mouse click at : " + this.mousePos.x + " " + this.mousePos.y)

            this.CheckMouseClick();
        });

    }

    public setConnectionFields(gameView: GameView, id: number, players: number, socket: WebSocket) {
        this.socket = socket;

        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;

        console.log(gameView);
    }



    /*
        Display attacking and defending cards in the middle of the table 
    */
    public displayBout(): void {
        let pos: { x: number, y: number }[];
        let attackingCardSize: number = this.gameView.attackingCards.length;
        let defendingCardSize: number = this.gameView.defendingCards.length;

        for (let i = 0; i < attackingCardSize; i++) {
            let img: HTMLImageElement = this.cardImage(this.gameView.attackingCards[i]);
            pos = this.boutCardPositions.get(attackingCardSize % 4);

            this.context.drawImage(img, pos[i].x, pos[i].y, this.cardWidth, this.cardHeight);
        }

        for (let i = 0; i < defendingCardSize; i++) {
            let img: HTMLImageElement = this.cardImage(this.gameView.defendingCards[i]);

            this.context.drawImage(img, pos[i].x + 20, pos[i].y, this.cardWidth, this.cardHeight);
        }
    }

    /*
        Returns the index of the selected card position
    */
    private GetCardSelected(): number {
        let x: number = this.positionsAroundTable[0].x;
        let w: number = this.positionsAroundTable[0].tWidth;

        return (this.mousePos.x - ((x - w / 2) + 7)) / 25;
    }

    /*
        Check if the mouse click is within the main players hand
    */
    private isCardSelected(): boolean {
        let x: number = this.positionsAroundTable[0].x;
        let y: number = this.positionsAroundTable[0].y;
        let w: number = this.positionsAroundTable[0].tWidth;

        return x - w / 2 + this.mouseClickMargin < this.mousePos.x &&
            this.mousePos.x <= x + w / 2 + this.mouseClickMargin &&
            y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
    }

    private isButtonSelected(): boolean {
        let x: number = this.positionsAroundTable[0].x;
        let y: number = this.positionsAroundTable[0].y;
        let w: number = this.positionsAroundTable[0].tWidth;

        if (this.id == this.gameView.attackingPlayer) {
            this.textMetrics = this.context.measureText(this.doneStr);

            return x + w / 2 + this.cardWidth - this.textLeftMargin + this.mouseClickMargin <
                this.mousePos.x && this.mousePos.x <= x + w / 2 + this.cardWidth +
                this.textLeftMargin + this.textMetrics.width + this.mouseClickMargin && 
                y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
        }
        else if (this.id == this.gameView.defendingPlayer) {
            this.textMetrics = this.context.measureText(this.takeStr);

            return x + w / 2 + this.cardWidth - this.textLeftMargin + this.mouseClickMargin <
                this.mousePos.x && this.mousePos.x <= x + w / 2 + this.cardWidth +
                this.textLeftMargin + this.textMetrics.width + this.mouseClickMargin && 
                y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
        }
    }

    /*
        Function that tells which card the attacking player has selected to attack 
    */
    private CheckMouseClick(): void {
        let strJSON: string;
        if (this.gameView.attackingPlayer == this.id || this.gameView.defendingPlayer == this.id) {
            if (this.isCardSelected()) {
                let cardIndex: number = Math.floor(this.GetCardSelected());

                if (cardIndex >= this.gameView.hand.length) {
                    cardIndex = this.gameView.hand.length - 1;
                }

                console.log("Card Index clicked is " + cardIndex);

                strJSON = JSON.stringify({
                    Message: this.gameView.attackingPlayer == this.id ? "Attacking" : "Defending",
                    Card: cardIndex
                });
            }
            else if (this.isButtonSelected()) {
                strJSON = JSON.stringify({
                    Message: this.gameView.attackingPlayer == this.id ? "Done" : "Take",
                });
            }

            this.socket.send(strJSON);
            console.log(strJSON);
        }
    }

    /*
        Display Discarded Heap 
    */
    public displayDiscardedHeap(): void {

        for (let i = 0; i < this.gameView.discardHeapSize; i++) {
            let img: HTMLImageElement = this.cardImage();
            this.context.save();

            this.context.translate(this.cardRightX + this.cardWidth + this.cardWidth / 2, this.deckPosY + this.cardHeight / 2);

            // getting random angle and y position to replicate the real world discarded pile
            let angle: number = Math.random() * Math.PI * 2;
            let yPos: number = Math.random() * (this.deckPosY + 50 - this.deckPosY - 50) + this.deckPosY - 50;

            this.context.rotate(angle);
            this.context.translate(-this.cardRightX - this.cardWidth / 2,
                -this.deckPosY - this.cardHeight / 2);
            this.context.drawImage(img, this.cardRightX, yPos,
                this.cardWidth, this.cardHeight);

            this.context.restore();
        }
    }

    /*
        Dispaly the Suit of the Trump card when there is no deck  
    */
    public displayTrumpSuit(): void {
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY,
            this.cardWidth, this.cardHeight);
    }

    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck 
    */
    public displayDeck(): void {
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.save();

        this.context.translate(this.cardLeftX + this.cardWidth + this.cardWidth / 2,
            this.deckPosY + this.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.cardLeftX - this.cardWidth / 2,
            -this.deckPosY - this.cardHeight / 2);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY,
            this.cardWidth, this.cardHeight);

        this.context.restore();

        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.cardImage();
            this.context.drawImage(
                img, this.cardLeftX + i + 0.5, this.deckPosY,
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
        Returns an image for a given card.
    */
    public cardImage(card?: Card): HTMLImageElement {
        let strCard: string;
        if (card) {
            let strRank: string = this.fromIntToRank(card.rank);
            let strSuit: string = this.fromIntToSuit(card.suit);
            strCard = strRank.concat(strSuit);
        } else {
            strCard = this.backCard;
        }


        if (this.cardImages.has(strCard)) {
            return this.cardImages.get(strCard);
        }
        else {
            let img = new Image();
            img.onload = () => this.displayStateOfTheGame();
            img.src = this.dir.concat(strCard.concat(".png"));

            this.cardImages.set(strCard, img);
            return this.cardImages.get(strCard);
        }
    }

    /*
        displays the cards from the gameView object 
    */
    private displayMainPlayersHand(hand: Card[], x: number, y: number, tWidth: number) {
        for (let i = 0; i < hand.length; i++) {
            let img: HTMLImageElement = this.cardImage(hand[i]);
            this.context.drawImage(
                img, x - tWidth / 2 + i * 25, y, this.cardWidth,
                this.cardHeight
            );
        }

    }

    /*
        Displays the face down cards of opponents
    */
    private displayFaceDownCards(playerView: PlayerView, x: number, y: number, tWidth: number) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img: HTMLImageElement = this.cardImage();
            this.context.drawImage(
                img, x - tWidth / 2 + i * 25, y, this.cardWidth,
                this.cardHeight
            );
        }
    }

    /*
        Displays the "Your Turn" message to remind the attacking player to attack 
    */
    private displayBox(btnStr: string, x: number, y: number): void {
        this.context.save();

        this.textMetrics = this.context.measureText(btnStr);
        this.context.strokeStyle = 'white';

        this.context.fillText(btnStr, x, y);

        this.context.strokeRect(x - this.textLeftMargin, y - this.textUpperMargin,
            this.textMetrics.width + 2 * this.textLeftMargin,
            this.boxHeight
        );

        this.context.restore();
    }


    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    public displayPlayersHelper(currentID: number, index: number, position: number[]) {
        let buttonStr: string;
        let pos: { x: number, y: number, tWidth: number };

        pos = this.positionsAroundTable[position[index] - 1];

        this.context.lineWidth = 5;
        this.textMetrics = this.context.measureText("Player " + currentID);

        this.context.fillText("Player " + currentID, pos.x - this.textMetrics.width / 2,
            pos.y + this.offset);

        if (currentID == this.id) {
            this.displayMainPlayersHand(this.gameView.hand, pos.x, pos.y, pos.tWidth);
        } else {
            this.displayFaceDownCards(this.gameView.playersView[index], pos.x, pos.y, pos.tWidth);
        }
        if (currentID == this.gameView.attackingPlayer) {
            this.context.strokeStyle = 'lime';
        } else if (currentID == this.gameView.defendingPlayer) {
            this.context.strokeStyle = 'red';
        } else {
            this.context.strokeStyle = 'black';
        }

        this.context.strokeRect(
            pos.x - this.textLeftMargin - this.textMetrics.width / 2,
            pos.y - this.textUpperMargin + this.offset,
            this.textMetrics.width + 2 * this.textLeftMargin, this.boxHeight
        );

        if (this.id == currentID) {
            // display "Your Turn" if no cards were played 
            if (this.id == this.gameView.attackingPlayer &&
                this.gameView.attackingCards.length == 0) {

                this.displayBox(this.yourTurnStr, pos.x + pos.tWidth / 2 + this.cardWidth,
                    pos.y + this.offset);
            }

            // display "Done" button on the attacking player if attack successfully defeated 
            // otherwise attack
            if (this.id == this.gameView.attackingPlayer && this.gameView.attackingCards.length ==
                this.gameView.defendingCards.length && this.gameView.attackingCards.length > 0) {
                this.displayBox(this.doneStr, pos.x + pos.tWidth / 2 + this.cardWidth,
                    pos.y + this.offset);
            }

            // display "Take" button on the defending player if cannot defend / just want to
            if (this.id == this.gameView.defendingPlayer && this.gameView.attackingCards.length >
                this.gameView.defendingCards.length) {
                this.displayBox(this.takeStr, pos.x + pos.tWidth / 2 + this.cardWidth,
                    pos.y + this.offset);
            }
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
                return [1, 3, 4, 5]
            case 5:
                return [1, 2, 3, 5, 6]
            case 6:
                return [1, 2, 3, 4, 5, 6]
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

            if (this.isFirst) {
                this.totalCardWidth = (this.gameView.playersView[i].numberOfCards - 1) * 25
                    + this.cardWidth;

                this.positionsAroundTable[position[i] - 1].x = this.positionsAroundTable[position[i] - 1].x
                    + this.totalCardWidth / 2;

                this.positionsAroundTable[position[i] - 1].tWidth = this.totalCardWidth;
            }

            this.displayPlayersHelper(currentID, i, position);
        }
        this.isFirst = false;
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
    public drawTable(): void {
        // Draws the empty table
        this.context.fillStyle = 'green';
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 10;

        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.save();

    }

    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    public displayStateOfTheGame(): void {

        this.drawTable();

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

    private errorWrite(textStr: string, x: number, y: number, w: number, h: number, textW: number) {
        this.context.fillText(textStr, x + this.textLeftMargin,
            this.deckPosY - 2 * this.textUpperMargin);

        this.context.strokeRect(x, y, w, h);
    }

    private clear(x: number, y: number, w: number, h: number): void {
        this.context.fillStyle = 'green';
        this.context.fillRect(x - 5, y - 5, w + 10, h + 10);
    }

    /*
        Display the error if Attack/Defense is illegal
    */
    public errorDisplay(type: string): void {
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'white';

        let textStr: string;

        switch (type) {
            case "illegal":
                textStr = "Illegal Move Made";
                break;
            case "wait":
                textStr = "Wait For The Card";
                break;
            default:
                console.log("Unknown type of the string (Check the error types)");
                break;
        }
        this.textMetrics = this.context.measureText(textStr);

        let x: number = this.positionsAroundTable[0].x - this.textLeftMargin - this.textMetrics.width / 2;
        let y: number = this.deckPosY - 3 * this.textUpperMargin;
        let w: number = this.textMetrics.width + 2 * this.textLeftMargin;
        let h: number = this.boxHeight;

        this.errorWrite(textStr, x, y, w, h, this.textMetrics.width);
        setTimeout(() => this.clear(x, y, w, h), 3000);
    }
}