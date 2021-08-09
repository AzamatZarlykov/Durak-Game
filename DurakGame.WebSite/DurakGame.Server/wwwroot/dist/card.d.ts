export declare class CardView {
    cardWidth: number;
    cardHeight: number;
    cardLowerY: number;
    cardUpperY: number;
    cardLeftX: number;
    cardMiddleX: number;
    cardRightX: number;
    dir: string;
    cardImages: Map<any, any>;
    backCard: string;
    constructor();
    fromIntToRank(enumRank: number): string;
    fromIntToSuit(enumSuit: number): string;
}
