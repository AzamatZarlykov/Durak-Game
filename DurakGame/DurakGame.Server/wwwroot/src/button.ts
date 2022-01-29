import { GameView } from './gameView.js';

export class Button {
    private x: number;
    private y: number;
    private name: string;
    private fontSize: number;
    private gameView: GameView;

    constructor(gameView: GameView, x: number, y: number, name: string, fontSize: number) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.fontSize = fontSize;

        this.gameView = gameView;
    }

    public draw(strokeS: string, textS: string): void {
        this.gameView.drawBox(
            this.name, this.x, this.y, strokeS, textS, true, this.fontSize
        );
    }

    public contains(mousePos: { x: number, y: number; }): boolean {

        let margin: number = this.gameView.textLeftMargin;
        let bHeight: number = this.gameView.textUpperMargin + this.fontSize;
        let lineW: number = 5;
        let textMetrics: TextMetrics = this.gameView.context.measureText(this.name);

        return this.x - textMetrics.width / 2 < mousePos.x &&
            mousePos.x <= this.x + textMetrics.width / 2 + margin &&
            this.y - this.fontSize / 2 < mousePos.y &&
            mousePos.y < this.y - this.fontSize / 2 + bHeight - lineW;
    }

    public getName(): string {
        return this.name;
    }

    public info(): void {
        console.log("X: " + this.x);
        console.log("Y: " + this.y);
        let a = this.gameView.context.measureText(this.name);
        console.log("Width: " + a.width);
        console.log("Height: " + this.fontSize);

    }

}