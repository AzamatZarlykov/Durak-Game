import { CardView } from './card.js';
var Rank;
(function (Rank) {
    Rank[Rank["Six"] = 6] = "Six";
    Rank[Rank["Seven"] = 7] = "Seven";
    Rank[Rank["Eight"] = 8] = "Eight";
    Rank[Rank["Nine"] = 9] = "Nine";
    Rank[Rank["Ten"] = 10] = "Ten";
    Rank[Rank["Jack"] = 11] = "Jack";
    Rank[Rank["Queen"] = 12] = "Queen";
    Rank[Rank["King"] = 13] = "King";
    Rank[Rank["Ace"] = 14] = "Ace";
})(Rank || (Rank = {}));
var Suit;
(function (Suit) {
    Suit[Suit["Club"] = 0] = "Club";
    Suit[Suit["Diamonds"] = 1] = "Diamonds";
    Suit[Suit["Heart"] = 2] = "Heart";
    Suit[Suit["Spade"] = 3] = "Spade";
})(Suit || (Suit = {}));
export class View {
    constructor() {
        this.strPlayer = "Player ";
        this.lowerY = 630;
        this.upperY = 200;
        this.leftX = 250;
        this.middleX = 650;
        this.rightX = 1150;
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.font = "12px serif";
        this.canvas = canvas;
        this.context = context;
        this.cardView = new CardView();
    }
    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    displayStateOfTheGame(gameView, id, totalPlayers) {
        this.displayPlayers(id, totalPlayers, gameView);
        // display the deck of the left side
        // outline the attacking and defending players' names
    }
    /*
        displays the cards from the gameView object
    */
    displayMainPlayersHand(hand, x, y) {
        for (let i = 0; i < hand.length; i++) {
            let img = this.cardView.cardImage(hand[i]);
            img.onload = () => {
                this.context.drawImage(img, x + i * 15, y, this.cardView.cardWidth, this.cardView.cardHeight);
            };
        }
        this.context.save();
    }
    /*
        Displays the face down cards of opponents
    */
    displayFaceDownCards(playerView, x, y) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img = this.cardView.faceDownCardImage();
            img.onload = () => {
                this.context.drawImage(img, x + i * 15, y, this.cardView.cardWidth, this.cardView.cardHeight);
            };
        }
        this.context.save();
    }
    /*
        Displays Players arounds the table
    */
    displayPlayers(mainPlayerID, totalPlayers, gameView) {
        let isMain;
        this.context.fillStyle = 'white';
        let position = this.getPositions(totalPlayers);
        let currentID;
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
                    }
                    else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardMiddleX, this.cardView.cardLowerY);
                    }
                    break;
                case 2:
                    this.context.fillText(this.strPlayer + currentID, this.leftX, this.lowerY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardLeftX, this.cardView.cardLowerY);
                        isMain = false;
                    }
                    else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardLeftX, this.cardView.cardLowerY);
                    }
                    break;
                case 3:
                    this.context.fillText(this.strPlayer + currentID, this.leftX, this.upperY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardLeftX, this.cardView.cardUpperY);
                        isMain = false;
                    }
                    else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardLeftX, this.cardView.cardUpperY);
                    }
                    break;
                case 4:
                    this.context.fillText(this.strPlayer + currentID, this.middleX, this.upperY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardMiddleX, this.cardView.cardUpperY);
                        isMain = false;
                    }
                    else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardMiddleX, this.cardView.cardUpperY);
                    }
                    break;
                case 5:
                    this.context.fillText(this.strPlayer + currentID, this.rightX, this.upperY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardRightX, this.cardView.cardUpperY);
                        isMain = false;
                    }
                    else {
                        this.displayFaceDownCards(gameView.playersView[i], this.cardView.cardRightX, this.cardView.cardUpperY);
                    }
                    break;
                case 6:
                    this.context.fillText(this.strPlayer + currentID, this.rightX, this.lowerY);
                    if (isMain) {
                        this.displayMainPlayersHand(gameView.hand, this.cardView.cardRightX, this.cardView.cardLowerY);
                        isMain = false;
                    }
                    else {
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
    getPositions(totalPlayers) {
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
        Displays the table and the current number of
        players joined to the game
    */
    drawTable() {
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
    removeTable() {
        this.canvas.style.display = "none";
    }
}
//# sourceMappingURL=view.js.map