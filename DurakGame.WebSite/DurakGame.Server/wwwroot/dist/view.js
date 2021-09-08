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
    constructor(socket) {
        this.cardWidth = 100;
        this.cardHeight = 120;
        this.yourTurnStr = "Your Turn";
        this.takeStr = "Take";
        this.doneStr = "Done";
        this.winnerStr = "Winner";
        this.durakStr = "Durak is ";
        this.mouseClickMargin = 7;
        this.dir = "images/deck/";
        this.backCard = "2B";
        this.cardImages = new Map();
        this.boutCardPositions = new Map();
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        this.socket = socket;
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;
        context.font = "17px serif";
        this.canvas = canvas;
        this.context = context;
        this.cardMiddleX = this.canvas.width / 2;
        this.cardLeftX = this.canvas.width / 3;
        this.cardRightX = this.canvas.width - this.cardLeftX;
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
        ];
        this.boutCardPositions.set(1, [{
                x: this.cardMiddleX,
                y: this.deckPosY
            }]);
        this.boutCardPositions.set(2, [
            { x: this.cardMiddleX - 2 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth, y: this.deckPosY }
        ]);
        this.boutCardPositions.set(3, [
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
        this.boutCardPositions.set(4, [
            { x: this.cardMiddleX - 4 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX - 2 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + 2 * this.cardWidth, y: this.deckPosY }
        ]);
        this.canvas.addEventListener("click", (e) => {
            this.mousePos.x = e.x;
            this.mousePos.y = e.y;
            console.log("The mouse click at : " + this.mousePos.x + " " + this.mousePos.y);
            this.CheckMouseClick();
        });
    }
    setConnectionFields(gameView, id, players) {
        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;
        console.log(gameView);
        console.log(this.gameView);
    }
    displayDurak() {
    }
    drawBox(text, x, y, strokeStyle, textStyle) {
        this.textMetrics = this.context.measureText(text);
        this.context.save();
        this.context.fillStyle = textStyle;
        this.context.strokeStyle = strokeStyle;
        this.context.fillText(text, x - this.textMetrics.width / 2, y);
        this.context.strokeRect(x - this.textMetrics.width / 2 - this.textLeftMargin, y - this.textUpperMargin, this.textMetrics.width + 2 * this.textLeftMargin, this.boxHeight);
        this.context.restore();
    }
    /*
        Display attacking and defending cards in the middle of the table
    */
    displayBout() {
        let pos;
        let attackingCardSize = this.gameView.attackingCards.length;
        let defendingCardSize = this.gameView.defendingCards.length;
        for (let i = 0; i < attackingCardSize; i++) {
            let img = this.cardImage(this.gameView.attackingCards[i]);
            pos = this.boutCardPositions.get(attackingCardSize % 4);
            this.context.drawImage(img, pos[i].x, pos[i].y, this.cardWidth, this.cardHeight);
        }
        for (let i = 0; i < defendingCardSize; i++) {
            let img = this.cardImage(this.gameView.defendingCards[i]);
            this.context.drawImage(img, pos[i].x + 20, pos[i].y, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Returns the index of the selected card position
    */
    GetCardSelected() {
        let x = this.positionsAroundTable[0].x;
        let w = this.positionsAroundTable[0].tWidth;
        return (this.mousePos.x - ((x - w / 2) + this.mouseClickMargin)) / 25;
    }
    /*
        Check if the mouse click is within the main players hand
    */
    isCardSelected() {
        let x = this.positionsAroundTable[0].x;
        let y = this.positionsAroundTable[0].y;
        let w = this.positionsAroundTable[0].tWidth;
        return x - w / 2 + this.mouseClickMargin < this.mousePos.x &&
            this.mousePos.x <= x + w / 2 + this.mouseClickMargin &&
            y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
    }
    withinTheButton(text) {
        let x = this.positionsAroundTable[0].x;
        let y = this.positionsAroundTable[0].y;
        let w = this.positionsAroundTable[0].tWidth;
        this.textMetrics = this.context.measureText(text);
        return x + w / 2 + this.cardWidth - this.textLeftMargin + this.mouseClickMargin <
            this.mousePos.x && this.mousePos.x <= x + w / 2 + this.cardWidth +
            this.textLeftMargin + this.textMetrics.width + this.mouseClickMargin &&
            y + this.offset - this.mouseClickMargin < this.mousePos.y && this.mousePos.y <=
            y + this.cardHeight + this.offset - this.mouseClickMargin;
    }
    isButtonSelected() {
        if (this.id == this.gameView.attackingPlayer) {
            return this.withinTheButton(this.doneStr);
        }
        else if (this.id == this.gameView.defendingPlayer) {
            return this.withinTheButton(this.takeStr);
        }
    }
    /*
        Function that tells which card the attacking player has selected to attack
    */
    CheckMouseClick() {
        let strJSON;
        if (this.gameView.attackingPlayer == this.id || this.gameView.defendingPlayer == this.id) {
            if (this.isCardSelected()) {
                let cardIndex = Math.floor(this.GetCardSelected());
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
                    Message: this.gameView.attackingPlayer == this.id ? "Done" : "Take"
                });
            }
            else {
                // if you click anywhere else just ignore
                return;
            }
            this.socket.send(strJSON);
            console.log(strJSON);
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
        if (hand.length != 0) {
            for (let i = 0; i < hand.length; i++) {
                let img = this.cardImage(hand[i]);
                this.context.drawImage(img, x - tWidth / 2 + i * 25, y, this.cardWidth, this.cardHeight);
            }
        }
        else {
            this.drawBox("Winner", x, y, 'white', 'white');
        }
    }
    /*
        Displays the face down cards of opponents
    */
    displayFaceDownCards(playerView, x, y, tWidth) {
        console.log("Number of cards " + playerView.numberOfCards);
        if (playerView.numberOfCards != 0) {
            for (let i = 0; i < playerView.numberOfCards; i++) {
                let img = this.cardImage();
                this.context.drawImage(img, x - tWidth / 2 + i * 25, y, this.cardWidth, this.cardHeight);
            }
        }
        else {
            this.drawBox("Winner", x, y, 'white', 'white');
        }
    }
    IsEndGame() {
        return this.gameView.attackingPlayer == this.gameView.defendingPlayer;
    }
    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    displayPlayersHelper(currentID, index, position) {
        let pos;
        pos = this.positionsAroundTable[position[index] - 1];
        console.log(pos);
        this.context.lineWidth = 5;
        this.textMetrics = this.context.measureText("Player " + currentID);
        if (currentID == this.id) {
            this.displayMainPlayersHand(this.gameView.hand, pos.x, pos.y, pos.tWidth);
        }
        else {
            this.displayFaceDownCards(this.gameView.playersView[currentID], pos.x, pos.y, pos.tWidth);
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
        this.drawBox("Player " + currentID, pos.x, pos.y + this.offset, this.context.strokeStyle, 'white');
        if (this.id == currentID) {
            // display "Your Turn" if no cards were played 
            if (this.id == this.gameView.attackingPlayer &&
                this.gameView.attackingCards.length == 0) {
                this.drawBox(this.yourTurnStr, pos.x + pos.tWidth / 2 + this.cardWidth, pos.y + this.offset, 'white', 'white');
            }
            // display "Done" button on the attacking player if attack successfully defeated 
            // otherwise attack
            if (this.id == this.gameView.attackingPlayer && this.gameView.attackingCards.length ==
                this.gameView.defendingCards.length && this.gameView.attackingCards.length > 0) {
                this.drawBox(this.doneStr, pos.x + pos.tWidth / 2 + this.cardWidth, pos.y + this.offset, 'white', 'white');
            }
            // display "Take" button on the defending player if cannot defend / just want to
            if (this.id == this.gameView.defendingPlayer && this.gameView.attackingCards.length >
                this.gameView.defendingCards.length) {
                this.drawBox(this.takeStr, pos.x + pos.tWidth / 2 + this.cardWidth, pos.y + this.offset, 'white', 'white');
            }
        }
        if (this.IsEndGame()) {
            this.drawBox(this.durakStr + this.gameView.defendingPlayer, innerWidth / 2 - 50, this.deckPosY, 'white', 'white');
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
        Displays Players arounds the table
    */
    displayPlayers() {
        this.context.fillStyle = 'white';
        let position = this.getPositions(this.totalPlayers);
        let currentID;
        for (let i = 0; i < this.totalPlayers; i++) {
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
        if (this.gameView.discardHeapSize != 0 && this.gameView.discardHeapChanged) {
            this.displayDiscardedHeap();
        }
        this.displayBout();
    }
    errorWrite(textStr, x, y, w, h, textW) {
        this.context.fillText(textStr, x + this.textLeftMargin, this.deckPosY - 2 * this.textUpperMargin);
        this.context.strokeRect(x, y, w, h);
    }
    clear(x, y, w, h) {
        this.context.fillStyle = 'green';
        this.context.fillRect(x - 5, y - 5, w + 10, h + 10);
    }
    /*
        Display the error if Attack/Defense is illegal
    */
    errorDisplay(type) {
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'white';
        let textStr;
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
        let x = this.positionsAroundTable[0].x - this.textLeftMargin - this.textMetrics.width / 2;
        let y = this.deckPosY - 3 * this.textUpperMargin;
        let w = this.textMetrics.width + 2 * this.textLeftMargin;
        let h = this.boxHeight;
        this.errorWrite(textStr, x, y, w, h, this.textMetrics.width);
        setTimeout(() => this.clear(x, y, w, h), 3000);
    }
}
//# sourceMappingURL=view.js.map