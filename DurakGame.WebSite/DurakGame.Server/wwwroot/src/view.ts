import { CardView } from './card.js';

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

    private strPlayer: string = "Player ";

    private lowerY: number = 630;
    private upperY: number = 200;

    private leftX: number = 250;
    private middleX: number = 650;
    private rightX: number = 1150;

    private cardView: CardView;
    private gameView: GameView;

    private id: number;
    private totalPlayers: number;

    private positionsAroundTable: { xCard: number, yCard: number, x: number, y: number }[];

    constructor(gameView: GameView, id: number, players: number) {
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");
        

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        context.font = "12px serif";

        this.canvas = canvas;
        this.context = context;

        this.cardView = new CardView()
        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;

        this.positionsAroundTable = [
            { xCard: this.cardView.cardMiddleX, yCard: this.cardView.cardLowerY, x: this.middleX, y: this.lowerY },
            { xCard: this.cardView.cardLeftX, yCard: this.cardView.cardLowerY, x: this.leftX, y: this.lowerY },
            { xCard: this.cardView.cardLeftX, yCard: this.cardView.cardUpperY, x: this.leftX, y: this.upperY },
            { xCard: this.cardView.cardMiddleX, yCard: this.cardView.cardUpperY, x: this.middleX, y: this.upperY },
            { xCard: this.cardView.cardRightX, yCard: this.cardView.cardUpperY, x: this.rightX, y: this.upperY },
            { xCard: this.cardView.cardRightX, yCard: this.cardView.cardLowerY, x: this.rightX, y: this.lowerY }
        ]

        console.log(gameView);
    }

    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    public displayStateOfTheGame(): void {

        this.drawTable();

        this.displayPlayers();

        this.displayDeck();

        // outline the attacking and defending players' names

    }

    public displayDeck() {
        // draw the trump card horizontally
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.save();
        this.context.translate(this.cardView.cardLeftX + this.cardView.cardWidth + this.cardView.cardWidth / 2, this.cardView.deckPosY + this.cardView.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.cardView.cardLeftX - this.cardView.cardWidth / 2, -this.cardView.deckPosY - this.cardView.cardHeight / 2);
        this.context.drawImage(img, this.cardView.cardLeftX, this.cardView.deckPosY, this.cardView.cardWidth, this.cardView.cardHeight);
        this.context.restore();

        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.faceDownCardImage();
            this.context.drawImage(img, this.cardView.cardLeftX + i + 0.5, this.cardView.deckPosY, this.cardView.cardWidth, this.cardView.cardHeight)
        }

    }

    /*
        Returns an image for a given card.
    */
    public cardImage(card: Card): HTMLImageElement {
        let strRank: string = this.cardView.fromIntToRank(card.rank);
        let strSuit: string = this.cardView.fromIntToSuit(card.suit);
        let strCard: string = strRank.concat(strSuit);

        if (this.cardView.cardImages.has(strCard)) {
            return this.cardView.cardImages.get(strCard);
        }
        else {
            let img = new Image();
            img.onload = () => this.displayStateOfTheGame();
            img.src = this.cardView.dir.concat(strCard.concat(".png"));

            this.cardView.cardImages.set(strCard, img);
            return this.cardView.cardImages.get(strCard);
        }
    }

    /*
        Returns an image for a given card.
    */
    public faceDownCardImage(): HTMLImageElement {
        if (this.cardView.cardImages.has(this.cardView.backCard)) {
            return this.cardView.cardImages.get(this.cardView.backCard);
        }
        else {
            let img = new Image();
            img.onload = () => this.displayStateOfTheGame();
            img.src = this.cardView.dir.concat(this.cardView.backCard.concat(".png"));

            this.cardView.cardImages.set(this.cardView.backCard, img);
            return this.cardView.cardImages.get(this.cardView.backCard);
        }
    }

    /*
        displays the cards from the gameView object 
    */
    private displayMainPlayersHand(hand: Card[], x: number, y: number) {
        for (let i = 0; i < hand.length; i++) {
            let img: HTMLImageElement = this.cardImage(hand[i]);
            this.context.drawImage(img, x + i * 15, y, this.cardView.cardWidth, this.cardView.cardHeight);
        }
    }


    /*
        Displays the face down cards of opponents
    */
    private displayFaceDownCards(playerView: PlayerView, x: number, y: number) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img: HTMLImageElement = this.faceDownCardImage();
            this.context.drawImage(img, x + i * 15, y, this.cardView.cardWidth, this.cardView.cardHeight)
        }
    }


    public displayPlayersHelper(model: { property1: boolean }, index: number, xCard: number, yCard: number, x: number, y: number, id: number) {
        this.context.fillText(this.strPlayer + id, x, y);

        if (model.property1) {
            this.displayMainPlayersHand(this.gameView.hand, xCard, yCard);
            model.property1 = false;
            return model;
        } else {
            this.displayFaceDownCards(this.gameView.playersView[index], xCard, yCard);
        }
    }

    /*
        Displays Players arounds the table 
    */
    public displayPlayers(): void {
        let isMain: boolean;
        const bar = { property1: isMain };

        this.context.fillStyle = 'white';

        let position: number[] = this.getPositions(this.totalPlayers);
        let currentID: number;
        let currentPos: { xCard: number, yCard: number, x: number, y: number };

        for (let i = 0; i < this.totalPlayers; i++) {
            currentID = (this.id + i) % this.totalPlayers;
            currentPos = this.positionsAroundTable[position[i] - 1];

            if (currentID == this.id) {
                bar.property1 = true;
            }

            this.displayPlayersHelper(bar, i, currentPos.xCard, currentPos.yCard,
                currentPos.x, currentPos.y, currentID);
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
        Displays the table and the current number of
        players joined to the game
    */
    public drawTable(): void {
        // Draws the empty table
        this.context.fillStyle = 'green';
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 10;

        this.context.fillRect(150, 40, 1100, 600);
        this.context.strokeRect(150, 40, 1100, 600);
        this.context.save();

    }
    /*
        Stops displaying the table and the current number of
        players joined to the game
    */
    public removeTable() {
        this.canvas.style.display = "none";
    }
}