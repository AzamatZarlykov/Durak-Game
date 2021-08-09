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
    private strPlayer;
    private lowerY;
    private upperY;
    private leftX;
    private middleX;
    private rightX;
    private cardView;
    constructor();
    displayStateOfTheGame(gameView: GameView, id: number, totalPlayers: number): void;
    private displayMainPlayersHand;
    private displayFaceDownCards;
    displayPlayers(mainPlayerID: number, totalPlayers: number, gameView: GameView): void;
    private getPositions;
    drawTable(): void;
    removeTable(): void;
}
export {};
