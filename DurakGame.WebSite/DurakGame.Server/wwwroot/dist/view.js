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
    constructor(gameView, id, players) {
        this.strPlayer = "Player ";
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;
        context.font = "17px serif";
        this.canvas = canvas;
        this.context = context;
        this.cardView = new CardView(this.canvas);
        this.lowerY = this.canvas.height - 20;
        this.upperY = 200;
        this.middleX = this.canvas.width / 2 - 40;
        this.leftX = 110;
        this.rightX = this.canvas.width - 170;
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
        ];
        console.log(gameView);
    }
    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    displayStateOfTheGame() {
        this.drawTable();
        this.displayPlayers();
        if (this.gameView.deckSize == 0) {
            this.displayTrumpSuit();
        }
        else {
            this.displayDeck();
        }
    }
    /*
        Dispaly the Suit of the Trump card when there is no deck
    */
    displayTrumpSuit() {
        let img = this.cardImage(this.gameView.trumpCard);
        this.context.drawImage(img, this.cardView.cardLeftX, this.cardView.deckPosY, this.cardView.cardWidth, this.cardView.cardHeight);
    }
    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck
    */
    displayDeck() {
        let img = this.cardImage(this.gameView.trumpCard);
        this.context.save();
        this.context.translate(this.cardView.cardLeftX + this.cardView.cardWidth + this.cardView.cardWidth / 2, this.cardView.deckPosY + this.cardView.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.cardView.cardLeftX - this.cardView.cardWidth / 2, -this.cardView.deckPosY - this.cardView.cardHeight / 2);
        this.context.drawImage(img, this.cardView.cardLeftX, this.cardView.deckPosY, this.cardView.cardWidth, this.cardView.cardHeight);
        this.context.restore();
        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.faceDownCardImage();
            this.context.drawImage(img, this.cardView.cardLeftX + i + 0.5, this.cardView.deckPosY, this.cardView.cardWidth, this.cardView.cardHeight);
        }
    }
    /*
        Returns an image for a given card.
    */
    cardImage(card) {
        let strRank = this.cardView.fromIntToRank(card.rank);
        let strSuit = this.cardView.fromIntToSuit(card.suit);
        let strCard = strRank.concat(strSuit);
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
    faceDownCardImage() {
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
    displayMainPlayersHand(hand, x, y) {
        for (let i = 0; i < hand.length; i++) {
            let img = this.cardImage(hand[i]);
            this.context.drawImage(img, x + i * 20, y, this.cardView.cardWidth, this.cardView.cardHeight);
        }
    }
    /*
        Displays the face down cards of opponents
    */
    displayFaceDownCards(playerView, x, y) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img = this.faceDownCardImage();
            this.context.drawImage(img, x + i * 20, y, this.cardView.cardWidth, this.cardView.cardHeight);
        }
    }
    displayPlayersHelper(model, index, xCard, yCard, x, y, id) {
        if (model.isCurrent) {
            this.displayMainPlayersHand(this.gameView.hand, xCard, yCard);
            model.isCurrent = false;
        }
        else {
            this.displayFaceDownCards(this.gameView.playersView[index], xCard, yCard);
        }
        if (model.isAttacking) {
            this.context.strokeStyle = 'lime';
            model.isAttacking = false;
        }
        else if (model.isDefending) {
            this.context.strokeStyle = 'red';
            model.isDefending = false;
        }
        else {
            this.context.strokeStyle = 'black';
        }
        this.context.lineWidth = 5;
        this.context.strokeRect(x - 10, y - 20, 75, 30);
        this.context.fillText(this.strPlayer + id, x, y);
        this.context.save();
    }
    /*
        Displays Players arounds the table
    */
    displayPlayers() {
        let isMain;
        let isAtt;
        let isDef;
        const bar = { isCurrent: isMain, isAttacking: isAtt, isDefending: isDef };
        this.context.fillStyle = 'white';
        let position = this.getPositions(this.totalPlayers);
        let currentID;
        let currentPos;
        for (let i = 0; i < this.totalPlayers; i++) {
            currentID = (this.id + i) % this.totalPlayers;
            currentPos = this.positionsAroundTable[position[i] - 1];
            if (currentID == this.id) {
                bar.isCurrent = true;
            }
            if (this.gameView.attackingPlayer == currentID) {
                bar.isAttacking = true;
            }
            else if (this.gameView.defendingPlayer == currentID) {
                bar.isDefending = true;
            }
            this.displayPlayersHelper(bar, i, currentPos.xCard, currentPos.yCard, currentPos.x, currentPos.y, currentID);
        }
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
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
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