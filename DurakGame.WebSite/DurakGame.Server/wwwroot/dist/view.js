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
        this.cardWidth = 100;
        this.cardHeight = 120;
        this.dir = "images/deck/";
        this.backCard = "2B";
        this.cardImages = new Map();
        let canvas = document.getElementById("canvas");
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
        ];
        console.log(gameView);
    }
    /*
        Dispaly the Suit of the Trump card when there is no deck
    */
    displayTrumpSuit() {
        let img = this.cardImage(this.gameView.trumpCard);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY, this.cardWidth, this.cardHeight);
    }
    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck
    */
    displayDeck() {
        let img = this.cardImage(this.gameView.trumpCard);
        this.context.save();
        this.context.translate(this.cardLeftX + this.cardWidth +
            this.cardWidth / 2, this.deckPosY + this.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.cardLeftX - this.cardWidth / 2, -this.deckPosY - this.cardHeight / 2);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY, this.cardWidth, this.cardHeight);
        this.context.restore();
        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.cardImage();
            this.context.drawImage(img, this.cardLeftX + i + 0.5, this.deckPosY, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Returns the string from number that represents the
        rank of the card
    */
    fromIntToRank(enumRank) {
        if (4 < enumRank && enumRank < 10) {
            return enumRank.toString();
        }
        return "TJQKA"[enumRank - 10];
    }
    /*
        Returns the string from number that represents the
        suit of the card
    */
    fromIntToSuit(enumSuit) {
        return "CDHS"[enumSuit];
    }
    /*
        Returns an image for a given card.
    */
    cardImage(card) {
        let strCard;
        if (card) {
            let strRank = this.fromIntToRank(card.rank);
            let strSuit = this.fromIntToSuit(card.suit);
            strCard = strRank.concat(strSuit);
        }
        else {
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
    displayMainPlayersHand(hand, x, y) {
        for (let i = 0; i < hand.length; i++) {
            let img = this.cardImage(hand[i]);
            this.context.drawImage(img, x + i * 20, y, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Displays the face down cards of opponents
    */
    displayFaceDownCards(playerView, x, y) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img = this.cardImage();
            this.context.drawImage(img, x + i * 20, y, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    displayPlayersHelper(currentID, index, x, y, id) {
        this.context.lineWidth = 5;
        let textMetrics = this.context.measureText("Player " + id);
        // the position of the text x position depends on the number of cards
        let xPosBasedOnCards = this.gameView.playersView[index].numberOfCards * 20 / 2;
        this.context.fillText("Player " + id, x + xPosBasedOnCards, y + this.offset);
        if (currentID == this.id) {
            this.displayMainPlayersHand(this.gameView.hand, x, y);
        }
        else {
            this.displayFaceDownCards(this.gameView.playersView[index], x, y);
        }
        if (currentID == this.gameView.attackingPlayer) {
            this.context.strokeStyle = 'lime';
        }
        else if (currentID == this.gameView.defendingPlayer) {
            this.context.strokeStyle = 'red';
        }
        else {
            this.context.strokeStyle = 'black';
        }
        this.context.strokeRect(x + xPosBasedOnCards - this.textLeftMargin, y - this.textUpperMargin + this.offset, textMetrics.width + 2 * this.textLeftMargin, this.boxHeight);
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
        Displays Players arounds the table
    */
    displayPlayers() {
        this.context.fillStyle = 'white';
        let position = this.getPositions(this.totalPlayers);
        let currentID;
        let currentPos;
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
    removeTable() {
        this.canvas.style.display = "none";
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
}
//# sourceMappingURL=view.js.map