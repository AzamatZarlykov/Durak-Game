export class View {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private cardWidth: number;
    private cardHeight: number;

    private strPlayer: string = "Player ";

    private lowerY: number = 630;
    private upperY: number = 200;

    private middleX: number = 650;
    private leftX: number = 250;
    private rightX: number = 1150;

    constructor() {
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        context.font = "12px serif";

        this.canvas = canvas;
        this.context = context;
    }
    /*
        Displays Players arounds the table 
    */
    public displayPlayers(mainPlayerID: number, totalPlayers: number): void {

        this.context.fillStyle = 'white';

        let position: number[] = this.getPositions(totalPlayers);
        let currentID: number;

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
            console.log(currentID + " is Drawn");
        }
        this.context.save();
    }

    /*
        Returns the position of players depending on the
        size of players playing
    */
    private getPositions(totalPlayers: number): number[] {
        switch (totalPlayers) {
            case 2:
                return [1, 4];
            case 3:
                return [1, 3, 5];
            case 4:
                return [1, 3, 4, 5]
            case 5:
                return [1, 2, 3, 5, 6]
            case 6:
                return [1, 2, 3, 4, 5, 6]
        }
    }

    /*
        Displays the table and the current number of
        players joined to the game
    */
    public drawTable(): void{
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
    public removeTable() {
        this.canvas.style.display = "none";
    }
}