import { GameView } from './gameView.js';

let playingTable = document.getElementById("playingTable") as HTMLDivElement;
let startButton = document.getElementById("startGameButton") as HTMLButtonElement;

let socket: WebSocket;
let connectionUrl: string;

let scheme: string = document.location.protocol === "https:" ? "wss" : "ws";
let port: string = document.location.port ? (":" + document.location.port) : "";

let id: number; // id of the player 
let nPlayers: number; // total number of players on the webpage
let nPlayersPlaying: number; // total number of players playing on the table

let informLeavingCommand: string = "InformLeaving";
let joinGameCommand: string = "JoinGame";
let requestStateGameCommand: string = "RequestStateGame";
let setTotalPlayersCommand: string = "SetTotalPlayers";
let UpdateGameProcessCommand: string = "UpdateGameProcess";
let IllegalCommand: string = "Illegal";
let WaitCommand: string = "Wait";
let TakeCardsCommand: string = "TakeCards";
let TookCardsCommand: string = "TookCards";
let GameCreationInProcess: string = "GameIsBeingCreated";

let view: GameView;

let allCommands: string[] = [
    informLeavingCommand,
    joinGameCommand,
    requestStateGameCommand,
    setTotalPlayersCommand,
    UpdateGameProcessCommand,
    IllegalCommand,
    WaitCommand,
    TakeCardsCommand,
    TookCardsCommand,
    GameCreationInProcess,
];

connectionUrl = scheme + "://" + document.location.hostname + port + "/ws";

socket = new WebSocket(connectionUrl);

socket.onopen = function (event): void {
    view = new GameView(socket);

    updateState();
};

socket.onclose = function (event): void {
    updateState();
};
socket.onerror = updateState;

socket.onmessage = function (event): void {
    let obj = JSON.parse(event.data);


    if (allCommands.indexOf(obj.command) > -1) {

        if ([informLeavingCommand, setTotalPlayersCommand, joinGameCommand].includes(obj.command)) {
            setTotalPlayers(obj.totalPlayers);
        }

        switch (obj.command) {
            // Handles the event when the player leaves when the game is on. It updates the value of
            // number of people playing and rearranges the position
            // of players depending on IDs
            case (informLeavingCommand):
                if (playingTable.hidden == false) {
                    setPlayingPlayers(obj.sizeOfPlayers);

                    if (nPlayersPlaying > 1) {
                        setPlayingPlayers(nPlayersPlaying);
                    } else {
                        // when 1 person left the game is over. Close the board and tell server that game
                        // has finished
                        view.removeTable();

                        // no players playing
                        setPlayingPlayers(0);

                        console.log("The game is over");
                    }
                    console.log("Player " + obj.leavingPlayerID + " left the game");
                } else {
                    console.log("Player" + obj.leavingPlayerID + " left the server");
                }
                break;
            // When any player starts the game, the server sends this message to all the players in the 
            // game to join the playing room. This statement displays number of playing players and displays
            // each players position on the table
            case (joinGameCommand):

                setPlayerID(obj.playerID);
                setPlayingPlayers(obj.sizeOfPlayers);

                // hide the button
                startButton.style.display = 'none';

                view.setConnectionFields(obj.gameView, id, nPlayers);
                view.displayStateOfTheGame();
                break;
            // Handles the message about the state of the game from the server
            case (requestStateGameCommand):
                if (!obj.gameState) {
                    let data: string = constructJSONPayload("StartGame");
                    socket.send(data);
                } else {
                    // display the message on the screen of the player

                    console.log("Game is already being played");
                }
                break;
            case (UpdateGameProcessCommand):
                view.setConnectionFields(obj.gameView, id, nPlayers);
                view.displayStateOfTheGame();
                break;
            case (setTotalPlayersCommand):
                view.setTotalPlayers(nPlayers);
                break;
            case (IllegalCommand):
                view.displayMessage("illegal", false, 'white', 'white');
                break;
            case (WaitCommand):
                view.displayMessage("wait", false, 'white', 'white');
                break;
            case (TakeCardsCommand):
                view.setConnectionFields(obj.gameView, id, nPlayers);
                view.displayStateOfTheGame();
                view.displayMessage("takeCards", false, 'white', 'white');
                break;
            case (TookCardsCommand):
                view.displayMessage("tookCards", false, 'white', 'white');
                break;
            case (GameCreationInProcess):
                if (!view.gameInProgress) {
                    view.gameInProgress = true;
                    view.displayMenu();
                }
                break;
        }
    } else {
        console.log("Unknown command from the server");
    }
};

startButton.onclick = function (): void {
    if (nPlayers > 1) {
        let data: string = constructJSONPayload(requestStateGameCommand);
        socket.send(data);
    } else {
        console.log("Not enough people on the server to play");
    }
};

function updateState(): void {
    function disable() {
        startButton.disabled = true;
        view.removeTable();
    }
    function enable() {
        startButton.disabled = false;
        view.displayMenu();
    }

    if (!socket) {
        disable();
    } else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                disable();
                break;
            case WebSocket.CLOSING:
                disable();
                break;
            case WebSocket.CONNECTING:
                disable();
                break;
            case WebSocket.OPEN:
                enable();
                break;
            default:
                disable();
                break;
        }
    }
}

/*
Sets the total number of players playing in the game on html
*/
function setPlayingPlayers(count: number): void {
    nPlayersPlaying = count;
    console.log("Number Of Players In The Game: " + nPlayersPlaying);
}

/*
Returns the JSON object that containts the message to the server
*/
function constructJSONPayload(message: string): string {
    return JSON.stringify({
        From: id,
        Message: message,
    });
}

/*
Sets the total number of players on html
*/
function setTotalPlayers(count: number): void {
    nPlayers = count;
}

/*
Sets the player ID on html
*/
function setPlayerID(identifier: number): void {
    id = identifier;
    console.log("ID of the player is: " + id);
}
