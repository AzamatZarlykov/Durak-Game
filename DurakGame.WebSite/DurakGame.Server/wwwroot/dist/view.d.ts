interface PlayerView {
    numberOfCards: number;
    isAttacking: boolean;
}
declare enum Rank {
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
    Ace = 14
}
declare enum Suit {
    Club = 0,
    Diamonds = 1,
    Heart = 2,
    Spade = 3
}
export interface Card {
    rank: Rank;
    suit: Suit;
}
interface GameView {
    playerID: number;
    attackingPlayer: number;
    defendingPlayer: number;
    deckSize: number;
    discardHeapSize: number;
    hand: Card[];
    playersView: PlayerView[];
    trumpCard: Card;
}
export declare class View {
    private canvas;
    private context;
    private cardWidth;
    private cardHeight;
    private cardLowerY;
    private cardUpperY;
    private cardLeftX;
    private cardMiddleX;
    private cardRightX;
    private deckPosY;
    private offset;
    private dir;
    private backCard;
    private cardImages;
    private textUpperMargin;
    private textLeftMargin;
    private boxHeight;
    private gameView;
    private id;
    private totalPlayers;
    private positionsAroundTable;
    constructor(gameView: GameView, id: number, players: number);
    displayTrumpSuit(): void;
    displayDeck(): void;
    fromIntToRank(enumRank: number): string;
    fromIntToSuit(enumSuit: number): string;
    cardImage(card?: Card): HTMLImageElement;
    private displayMainPlayersHand;
    private displayFaceDownCards;
    displayPlayersHelper(currentID: number, index: number, x: number, y: number, id: number): void;
    private getPositions;
    displayPlayers(): void;
    removeTable(): void;
    drawTable(): void;
    displayStateOfTheGame(): void;
}
export {};
