import { Card } from './view.js';

export class CardView {


    public cardWidth: number = 80;
    public cardHeight: number = 110;

    public cardLowerY: number = 510;
    public cardUpperY: number = 80;

    public cardLeftX: number = 180;
    public cardMiddleX: number = 580;
    public cardRightX: number = 1080;

    public dir: string = "images/deck/";
    public cardImages = new Map();

    public backCard: string = "2B";
    constructor() {

    }

    /*
        Retrueves an image for a given card.
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
            img.src = this.dir.concat(strCard.concat(".png"));

            console.log(img.src);

            this.cardImages.set(strCard, img);
            return this.cardImages.get(strCard);
        }
    }

    public faceDownCardImage(): HTMLImageElement {
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
    private fromIntToRank(enumRank: number): string {
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
    private fromIntToSuit(enumSuit: number): string {
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