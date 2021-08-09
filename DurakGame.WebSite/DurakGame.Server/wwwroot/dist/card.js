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
        Returns the string from number that represents the
        rank of the card
    */
    fromIntToRank(enumRank) {
        if (5 < enumRank && enumRank < 10) {
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
}
//# sourceMappingURL=card.js.map