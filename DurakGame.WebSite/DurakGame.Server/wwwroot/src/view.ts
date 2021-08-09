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

interface GameView{
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

    constructor() {
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        context.font = "12px serif";

        this.canvas = canvas;
        this.context = context;

        this.cardView = new CardView()
    }
    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    public displayStateOfTheGame(gameView: GameView, id: number, totalPlayers: number): void {
        
        this.displayPlayers(id, totalPlayers, gameView);

        // display the deck of the left side

        // outline the attacking and defending players' names

    }

    /*
        displays the cards from the gameView object 
    */
    private displayMainPlayersHand(hand: Card[], x: number, y: number) {
        for (let i = 0; i < hand.length; i++) {
            let img: HTMLImageElement = this.cardView.cardImage(hand[i]);
            img.onload = () => {
                this.context.drawImage(img, x + i * 15, y, this.cardView.cardWidth, this.cardView.cardHeight);
            }
        }
        this.context.save();
    }


    /*
        Displays the face down cards of opponents
    */
    private displayFaceDownCards(playerView: PlayerView, x: number, y: number) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img: HTMLImageElement = this.cardView.faceDownCardImage();
            img.onload = () => {
                this.context.drawImage(img, x + i * 15, y, this.cardView.cardWidth, this.cardView.cardHeight)
            }
        }
        this.context.save();
    }

    /*
        Displays Players arounds the table 
    */
    public displayPlayers(mainPlayerID: number, totalPlayers: number, gameView: GameView): void {
        let isMain: boolean;

        this.context.fillStyle = 'white';

        let position: number[] = this.getPositions(totalPlayers);
        let currentID: number;

        for (let i = 0; i < totalPlayers; i++) {
            currentID = (mainPlayerID + i) % totalPlayers;

            if (currentID == mainPlayerID) {
                isMain = true;
            }

            switch (position[i]) {
                case 1:
                    this.context.fillText(this.strPlayer + currentID, this.middleX, this.lowerY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardMiddleX, this.cardView.cardLowerY);
                        isMain = false;
                    } else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardMiddleX, this.cardView.cardLowerY);
                    }
                    break; 
                case 2:
                    this.context.fillText(this.strPlayer + currentID, this.leftX, this.lowerY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardLeftX, this.cardView.cardLowerY);
                        isMain = false;
                    } else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardLeftX, this.cardView.cardLowerY);
                    }
                    break;
                case 3:
                    this.context.fillText(this.strPlayer + currentID, this.leftX, this.upperY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardLeftX, this.cardView.cardUpperY);
                        isMain = false;
                    } else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardLeftX, this.cardView.cardUpperY);
                    }
                    break;
                case 4:
                    this.context.fillText(this.strPlayer + currentID, this.middleX, this.upperY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardMiddleX, this.cardView.cardUpperY);
                        isMain = false;
                    } else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardMiddleX, this.cardView.cardUpperY);
                    }
                    break;
                case 5:
                    this.context.fillText(this.strPlayer + currentID, this.rightX, this.upperY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardRightX, this.cardView.cardUpperY);
                        isMain = false;
                    } else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardRightX, this.cardView.cardUpperY);
                    }
                    break;
                case 6:
                    this.context.fillText(this.strPlayer + currentID, this.rightX, this.lowerY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardRightX, this.cardView.cardLowerY);
                        isMain = false;
                    } else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardRightX, this.cardView.cardLowerY);
                    }
                    break;
            }
        }
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
        Displays the table and the current number of
        players joined to the game
    */
    public drawTable(): void{
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