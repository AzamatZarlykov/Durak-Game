export declare class CardView {
    private canvas;
    cardWidth: number;
    cardHeight: number;
    cardLowerY: number;
    cardUpperY: number;
    cardLeftX: number;
    cardMiddleX: number;
    cardRightX: number;
    deckPosY: number;
    dir: string;
    cardImages: Map<any, any>;
    backCard: string;
    constructor(canvas: HTMLCanvasElement);
    fromIntToRank(enumRank: number): string;
    fromIntToSuit(enumSuit: number): string;
}
