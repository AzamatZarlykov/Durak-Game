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

    hand: Card[];

    playersView: PlayerView[];
    trumpCard: Card;
}

export class View {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private cardWidth: number = 100;
    private cardHeight: number = 120;

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

    private textUpperMargin: number;
    private textLeftMargin: number;

    private boxHeight: number;

    private gameView: GameView;

    private id: number;
    private totalPlayers: number;

    private positionsAroundTable: { x: number, y: number }[];

    constructor(gameView: GameView, id: number, players: number) {
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;

        context.font = "17px serif";

        this.canvas = canvas;
        this.context = context;

        this.cardMiddleX = this.canvas.width / 2 - 100;
        this.cardLeftX = 50;
        this.cardRightX = this.canvas.width - 250;

        this.cardLowerY = this.canvas.height - this.cardHeight - 60;
        this.cardUpperY = 40;

        this.deckPosY = this.canvas.height / 2 - 90;

        this.offset = 160;

        this.textUpperMargin = 20;
        this.textLeftMargin = 10;

        this.boxHeight = 30;

        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;

        this.positionsAroundTable = [
            { x: this.cardMiddleX, y: this.cardLowerY },
            { x: this.cardLeftX, y: this.cardLowerY },
            { x: this.cardLeftX, y: this.cardUpperY },
            { x: this.cardMiddleX, y: this.cardUpperY },
            { x: this.cardRightX, y: this.cardUpperY },
            { x: this.cardRightX, y: this.cardLowerY }
        ]

        console.log(gameView);
    }



    /*
        Dispaly the Suit of the Trump card when there is no deck  
    */
    public displayTrumpSuit() {
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY,
            this.cardWidth, this.cardHeight);
    }

    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck 
    */
    public displayDeck() {
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.save();

        this.context.translate(this.cardLeftX + this.cardWidth +
            this.cardWidth / 2, this.deckPosY + this.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.cardLeftX - this.cardWidth / 2,
            -this.deckPosY - this.cardHeight / 2);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY,
            this.cardWidth, this.cardHeight);

        this.context.restore();

        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.faceDownCardImage();
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
    public cardImage(card: Card): HTMLImageElement {

        let strRank: string = this.fromIntToRank(card.rank);
        let strSuit: string = this.fromIntToSuit(card.suit);
        let strCard: string = strRank.concat(strSuit);

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
        Returns an image for a given card.
    */
    public faceDownCardImage(): HTMLImageElement {
        if (this.cardImages.has(this.backCard)) {
            return this.cardImages.get(this.backCard);
        }
        else {
            let img = new Image();
            img.onload = () => this.displayStateOfTheGame();
            img.src = this.dir.concat(this.backCard.concat(".png"));

            this.cardImages.set(this.backCard, img);
            return this.cardImages.get(this.backCard);
        }
    }

    /*
        displays the cards from the gameView object 
    */
    private displayMainPlayersHand(hand: Card[], x: number, y: number) {
        for (let i = 0; i < hand.length; i++) {
            let img: HTMLImageElement = this.cardImage(hand[i]);
            this.context.drawImage(
                img, x + i * 20, y, this.cardWidth, this.cardHeight
            );
        }
    }


    /*
        Displays the face down cards of opponents
    */
    private displayFaceDownCards(playerView: PlayerView, x: number, y: number) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img: HTMLImageElement = this.faceDownCardImage();
            this.context.drawImage(
                img, x + i * 20, y, this.cardWidth, this.cardHeight
            );
        }
    }

    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    public displayPlayersHelper(
        currentID: number, index: number, x: number, y: number, id: number
    ) {
        this.context.lineWidth = 5;
        let textMetrics: TextMetrics = this.context.measureText("Player " + id);

        // the position of the text x position depends on the number of cards
        let xPosBasedOnCards = this.gameView.playersView[index].numberOfCards * 20 / 2;
        this.context.fillText("Player " + id, x + xPosBasedOnCards, y + this.offset);

        if (currentID == this.id) {
            this.displayMainPlayersHand(this.gameView.hand, x, y);
        } else {
            this.displayFaceDownCards(this.gameView.playersView[index], x, y);
        }

        if (currentID == this.gameView.attackingPlayer) {
            this.context.strokeStyle = 'lime';
        } else if (currentID == this.gameView.defendingPlayer) {
            this.context.strokeStyle = 'red';
        } else {
            this.context.strokeStyle = 'black';
        }

        this.context.strokeRect(
            x + xPosBasedOnCards - this.textLeftMargin, y - this.textUpperMargin + this.offset,
            textMetrics.width + 2 * this.textLeftMargin, this.boxHeight
        );

        this.context.save();

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
        let currentPos: { x: number, y: number };

        for (let i = 0; i < this.totalPlayers; i++) {
            currentID = (this.id + i) % this.totalPlayers;
            currentPos = this.positionsAroundTable[position[i] - 1];

            this.displayPlayersHelper(currentID, i, currentPos.x, currentPos.y, currentID);
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

    }
}