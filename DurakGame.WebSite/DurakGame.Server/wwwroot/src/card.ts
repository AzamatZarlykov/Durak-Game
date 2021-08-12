export class CardView{
    private canvas: HTMLCanvasElement;

    public cardWidth: number;
    public cardHeight: number;

    public cardLowerY: number;
    public cardUpperY: number;

    public cardLeftX: number;
    public cardMiddleX: number;
    public cardRightX: number;

    public deckPosY: number;

    public dir: string = "images/deck/";

    public cardImages = new Map();

    public backCard: string = "2B";

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.cardMiddleX = this.canvas.width / 2 - 100;
        this.cardLeftX = 50;
        this.cardRightX = this.canvas.width - 250;

        this.cardLowerY = this.canvas.height - this.cardHeight - 50;
        this.cardUpperY = 40;

        this.deckPosY = this.canvas.height / 2 - 90;
    }

    /*
        Returns the string from number that represents the 
        rank of the card
    */
    public fromIntToRank(enumRank: number): string {
        if (4 < enumRank && enumRank < 10) {
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