export class CardView{


    public cardWidth: number = 80;
    public cardHeight: number = 110;

    public cardLowerY: number = 510;
    public cardUpperY: number = 80;

    public cardLeftX: number = 180;
    public cardMiddleX: number = 600;
    public cardRightX: number = 1080;

    public deckPosY: number = 320;

    public dir: string = "images/deck/";

    public cardImages = new Map();

    public backCard: string = "2B";
    constructor() {

    }

    /*
        Returns the string from number that represents the 
        rank of the card
    */
    public fromIntToRank(enumRank: number): string {
        if (5 < enumRank && enumRank < 10) {
            return enumRank.toString();
        }

        return "TJQKA"[enumRank - 10];

    }

    /*
        Returns the string from number that represents the
        suit of the card
    */
    public fromIntToSuit(enumSuit: number): string {
        return "CDHS"[enumSuit];
    }

}