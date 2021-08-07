export class View {
    constructor() {
        this.strPlayer = "Player ";
        this.lowerY = 630;
        this.upperY = 200;
        this.middleX = 650;
        this.leftX = 250;
        this.rightX = 1150;
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.font = "12px serif";
        this.canvas = canvas;
        this.context = context;
    }
    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    displayStateOfTheGame(gameView) {
        // display the main players hand
        // display face down cards of opponents cards
        // display the deck of the left side
        // outline the attacking and defending players' names
    }
    /*
        Displays Players arounds the table
    */
    displayPlayers(mainPlayerID, totalPlayers) {
        this.context.fillStyle = 'white';
        let position = this.getPositions(totalPlayers);
        let currentID;
        for (let i = 0; i < totalPlayers; i++) {
            currentID = (mainPlayerID + i) % totalPlayers;
            switch (position[i]) {
                case 1:
                    this.context.fillText(this.strPlayer + currentID, this.middleX, this.lowerY);
                    break;
                case 2:
                    this.context.fillText(this.strPlayer + currentID, this.leftX, this.lowerY);
                    break;
                case 3:
                    this.context.fillText(this.strPlayer + currentID, this.leftX, this.upperY);
                    break;
                case 4:
                    this.context.fillText(this.strPlayer + currentID, this.middleX, this.upperY);
                    break;
                case 5:
                    this.context.fillText(this.strPlayer + currentID, this.rightX, this.upperY);
                    break;
                case 6:
                    this.context.fillText(this.strPlayer + currentID, this.rightX, this.lowerY);
                    break;
            }
        }
        this.context.save();
    }
    /*
        Returns the position of players depending on the
        size of players playing
    */
    getPositions(totalPlayers) {
        switch (totalPlayers) {
            case 2:
                return [1, 4];
            case 3:
                return [1, 3, 5];
            case 4:
                return [1, 3, 4, 5];
            case 5:
                return [1, 2, 3, 5, 6];
            case 6:
                return [1, 2, 3, 4, 5, 6];
        }
    }
    /*
        Displays the table and the current number of
        players joined to the game
    */
    drawTable() {
        // Draws the empty table
        this.context.fillStyle = 'green';
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 10;
        this.context.fillRect(150, 40, 1100, 600);
        this.context.strokeRect(150, 40, 1100, 600);
        this.context.save();
    }
    /*
        Stops displaying the table and the current number of
        players joined to the game
    */
    removeTable() {
        this.canvas.style.display = "none";
    }
}
//# sourceMappingURL=view.js.map