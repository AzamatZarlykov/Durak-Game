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
    displayPlayers(mainPlayerID: number, totalPlayers: number): void;
    private getPositions;
    drawTable(): void;
    removeTable(): void;
}
