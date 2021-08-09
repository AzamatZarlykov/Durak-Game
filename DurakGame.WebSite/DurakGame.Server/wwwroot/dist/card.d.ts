import { Card } from './view.js';
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
    cardImage(card: Card): HTMLImageElement;
    faceDownCardImage(): HTMLImageElement;
    private fromIntToRank;
    private fromIntToSuit;
}
