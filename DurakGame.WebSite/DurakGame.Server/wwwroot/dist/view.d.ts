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
    discardHeapChanged: boolean;
    hand: Card[];
    playersView: PlayerView[];
    trumpCard: Card;
    attackingCards: Card[];
    defendingCards: Card[];
}
export declare class View {
    private canvas;
    private context;
    private cardWidth;
    private cardHeight;
    private yourTurnStr;
    private takeStr;
    private doneStr;
    private mouseClickMargin;
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
    private boutCardPositions;
    private textUpperMargin;
    private textLeftMargin;
    private boxHeight;
    private isFirst;
    private totalCardWidth;
    private mousePos;
    private gameView;
    private id;
    private totalPlayers;
    private textMetrics;
    private socket;
    private positionsAroundTable;
    constructor(socket: WebSocket);
    setConnectionFields(gameView: GameView, id: number, players: number): void;
    displayBout(): void;
    private GetCardSelected;
    private isCardSelected;
    private isButtonSelected;
    private CheckMouseClick;
    displayDiscardedHeap(): void;
    displayTrumpSuit(): void;
    displayDeck(): void;
    fromIntToRank(enumRank: number): string;
    fromIntToSuit(enumSuit: number): string;
    cardImage(card?: Card): HTMLImageElement;
    private displayMainPlayersHand;
    private displayFaceDownCards;
    private displayBox;
    displayPlayersHelper(currentID: number, index: number, position: number[]): void;
    private getPositions;
    displayPlayers(): void;
    removeTable(): void;
    drawTable(): void;
    displayStateOfTheGame(): void;
    private errorWrite;
    private clear;
    errorDisplay(type: string): void;
}
export {};
