import { GameView } from './gameView.js';

export class Button {
    public x: number;
    public y: number;
    public name: string;

    private gameView: GameView;

    constructor(x: number, y: number, name: string) {
        this.x = x;
        this.y = y;
        this.name = name;

        this.gameView = new GameView();
    }

    public draw(strokeS: string, textS: string, withRectangle: boolean): void {
        this.gameView.drawBox(
            this.name, this.x, this.y, strokeS, textS, withRectangle
        );
    }

    public contains(mousePos: {x: number, y: number}): boolean {
        let textMetrics: TextMetrics = this.gameView.context.measureText(this.name);

        return this.x - textMetrics.width / 2 < mousePos.x && mousePos.x <= this.x +
            textMetrics.width / 2 && this.y - this.gameView.defaultFontSize < mousePos.y &&
            mousePos.y < this.y - this.gameView.defaultFontSize + this.gameView.boxHeight;
    }
}