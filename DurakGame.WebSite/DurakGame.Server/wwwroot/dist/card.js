export class CardView {
    constructor() {
        this.cardWidth = 80;
        this.cardHeight = 110;
        this.cardLowerY = 510;
        this.cardUpperY = 80;
        this.cardLeftX = 180;
        this.cardMiddleX = 580;
        this.cardRightX = 1080;
        this.dir = "images/deck/";
        this.cardImages = new Map();
        this.backCard = "2B";
    }
    /*
        Retrueves an image for a given card.
    */
    cardImage(card) {
        let strRank = this.fromIntToRank(card.rank);
        let strSuit = this.fromIntToSuit(card.suit);
        let strCard = strRank.concat(strSuit);
        if (this.cardImages.has(strCard)) {
            return this.cardImages.get(strCard);
        }
        else {
            let img = new Image();
            img.src = this.dir.concat(strCard.concat(".png"));
            console.log(img.src);
            this.cardImages.set(strCard, img);
            return this.cardImages.get(strCard);
        }
    }
    faceDownCardImage() {
        if (this.cardImages.has(this.backCard)) {
            return this.cardImages.get(this.backCard);
        }
        else {
            let img = new Image();
            img.src = this.dir.concat(this.backCard.concat(".png"));
            console.log(img.src);
            this.cardImages.set(this.backCard, img);
            return this.cardImages.get(this.backCard);
        }
    }
    /*
        Returns the string from number that represents the
        rank of the card
    */
    fromIntToRank(enumRank) {
        if (5 < enumRank && enumRank < 11) {
            return enumRank.toString();
        }
        switch (enumRank) {
            case 11:
                return "J";
            case 12:
                return "Q";
            case 13:
                return "K";
            case 14:
                return "A";
        }
    }
    /*
        Returns the string from number that represents the
        suit of the card
    */
    fromIntToSuit(enumSuit) {
        switch (enumSuit) {
            case 0:
                return "C";
            case 1:
                return "D";
            case 2:
                return "H";
            case 3:
                return "S";
        }
    }
}
//# sourceMappingURL=card.js.map