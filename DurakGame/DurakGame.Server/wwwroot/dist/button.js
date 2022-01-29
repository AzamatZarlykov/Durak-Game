export class Button {
    constructor(gameView, x, y, name, fontSize) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.fontSize = fontSize;
        this.gameView = gameView;
    }
    draw(strokeS, textS) {
        this.gameView.drawBox(this.name, this.x, this.y, strokeS, textS, true, this.fontSize);
    }
    contains(mousePos) {
        let margin = this.gameView.textLeftMargin;
        let bHeight = this.gameView.textUpperMargin + this.fontSize;
        let lineW = 5;
        let textMetrics = this.gameView.context.measureText(this.name);
        return this.x - textMetrics.width / 2 < mousePos.x &&
            mousePos.x <= this.x + textMetrics.width / 2 + margin &&
            this.y - this.fontSize / 2 < mousePos.y &&
            mousePos.y < this.y - this.fontSize / 2 + bHeight - lineW;
    }
    getName() {
        return this.name;
    }
    info() {
        console.log("X: " + this.x);
        console.log("Y: " + this.y);
        let a = this.gameView.context.measureText(this.name);
        console.log("Width: " + a.width);
        console.log("Height: " + this.fontSize);
    }
}
//# sourceMappingURL=button.js.map