interface Hand {
}
interface PlayerView {
}
interface Card {
}
interface GameView {
    playerID: number;
    attackingPlayer: number;
    defendingPlayer: number;
    deckSize: number;
    discardHeapSize: number;
    hand: Hand[];
    playersView: PlayerView[];
    trumpCard: Card;
}
export declare class View {
    private canvas;
    private context;
    private cardWidth;
    private cardHeight;
    private strPlayer;
    private lowerY;
    private upperY;
    private middleX;
    private leftX;
    private rightX;
    constructor();
    displayStateOfTheGame(gameView: GameView): void;
    displayPlayers(mainPlayerID: number, totalPlayers: number): void;
    private getPositions;
    drawTable(): void;
    removeTable(): void;
}
export {};
