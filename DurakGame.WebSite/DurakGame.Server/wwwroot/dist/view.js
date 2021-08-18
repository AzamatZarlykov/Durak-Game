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
class MousePos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class View {
    constructor(gameView, id, players, socket) {
        this.cardWidth = 100;
        this.cardHeight = 120;
        this.dir = "images/deck/";
        this.backCard = "2B";
        this.cardImages = new Map();
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        this.socket = socket;
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;
        console.log("The size of the window : " + (window.innerWidth - 50));
        context.font = "17px serif";
        this.canvas = canvas;
        this.context = context;
        this.cardMiddleX = this.canvas.width / 2 - 100;
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
        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;
        this.positionsAroundTable = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ];
        this.canvas.addEventListener("click", (e) => {
            this.mousePos.x = e.x;
            this.mousePos.y = e.y;
            console.log("The mouse click at : " + this.mousePos.x + " " + this.mousePos.y);
            this.SendSelectedCard();
        });
        console.log(gameView);
    }
    /*
        Returns the index of the selected card position
    */
    GetCardSelected() {
        let x = this.positionsAroundTable[0].x;
        let w = this.positionsAroundTable[0].tWidth;
        return (this.mousePos.x - ((x - w / 2) + 7)) / 25;
    }
    /*
        Check if the mouse click is within the main players hand
    */
    isCardSelected() {
        let x = this.positionsAroundTable[0].x;
        let y = this.positionsAroundTable[0].y;
        let w = this.positionsAroundTable[0].tWidth;
        return x - w / 2 + 7 < this.mousePos.x && this.mousePos.x <= x + w / 2 + 7 &&
            y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
    }
    /*
        Function that tells which card the attacking player has selected to attack
    */
    SendSelectedCard() {
        if (this.gameView.attackingPlayer == this.id) {
            if (this.isCardSelected()) {
                let cardIndex = Math.floor(this.GetCardSelected());
                let strJSON = JSON.stringify({
                    Message: "Attacking",
                    AttackingCard: cardIndex
                });
                this.socket.send(strJSON);
                console.log(strJSON);
            }
        }
    }
    /*
        Display Discarded Heap
    */
    displayDiscardedHeap() {
        for (let i = 0; i < this.gameView.discardHeapSize; i++) {
            let img = this.cardImage();
            this.context.save();
            this.context.translate(this.cardRightX + this.cardWidth + this.cardWidth / 2, this.deckPosY + this.cardHeight / 2);
            // getting random angle and y position to replicate the real world discarded pile
            let angle = Math.random() * Math.PI * 2;
            let yPos = Math.random() * (this.deckPosY + 50 - this.deckPosY - 50) + this.deckPosY - 50;
            this.context.rotate(angle);
            this.context.translate(-this.cardRightX - this.cardWidth / 2, -this.deckPosY - this.cardHeight / 2);
            this.context.drawImage(img, this.cardRightX, yPos, this.cardWidth, this.cardHeight);
            this.context.restore();
        }
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
        this.context.translate(this.cardLeftX + this.cardWidth + this.cardWidth / 2, this.deckPosY + this.cardHeight / 2);
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
    displayMainPlayersHand(hand, x, y, tWidth) {
        for (let i = 0; i < hand.length; i++) {
            let img = this.cardImage(hand[i]);
            this.context.drawImage(img, x - tWidth / 2 + i * 25, y, this.cardWidth, this.cardHeight);
        }
    }
    // what positions
    /*
        Displays the face down cards of opponents
    */
    displayFaceDownCards(playerView, x, y, tWidth) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img = this.cardImage();
            this.context.drawImage(img, x - tWidth / 2 + i * 25, y, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    displayPlayersHelper(currentID, index, position) {
        let pos;
        pos = this.positionsAroundTable[position[index] - 1];
        this.context.lineWidth = 5;
        let textMetrics = this.context.measureText("Player " + currentID);
        this.context.fillText("Player " + currentID, pos.x - textMetrics.width / 2, pos.y + this.offset);
        if (currentID == this.id) {
            this.displayMainPlayersHand(this.gameView.hand, pos.x, pos.y, pos.tWidth);
        }
        else {
            this.displayFaceDownCards(this.gameView.playersView[index], pos.x, pos.y, pos.tWidth);
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
        this.context.strokeRect(pos.x - this.textLeftMargin - textMetrics.width / 2, pos.y - this.textUpperMargin + this.offset, textMetrics.width + 2 * this.textLeftMargin, this.boxHeight);
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
        if (this.gameView.discardHeapSize != 0) {
            this.displayDiscardedHeap();
        }
    }
}
//# sourceMappingURL=view.js.map