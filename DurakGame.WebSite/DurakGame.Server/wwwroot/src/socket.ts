import { GameView, State } from './gameView.js';

let playingTable = document.getElementById("playingTable") as HTMLDivElement;

let socket: WebSocket;
let connectionUrl: string;

let scheme: string = document.location.protocol === "https:" ? "wss" : "ws";
let port: string = document.location.port ? (":" + document.location.port) : "";

let id: number; // id of the player 
let nPlayers: number = 0; // total number of players on the webpage
let nPlayersPlaying: number = 0; // total number of players playing on the table

let informLeavingCommand: string = "InformLeaving";
let joinGameCommand: string = "JoinGame";
let requestStateGameCommand: string = "RequestStateGame";
let setTotalPlayersCommand: string = "SetTotalPlayers";
let UpdateGameProcessCommand: string = "UpdateGameProcess";
let IllegalCommand: string = "Illegal";
let WaitCommand: string = "Wait";
let TakeCardsCommand: string = "TakeCards";
let TookCardsCommand: string = "TookCards";
let UpdateAvailableIconsCommand: string = "UpdateAvailableIcons";
let UpdatePlayerSetupCommand: string = "UpdatePlayerSetup";
let StartGameCommand: string = "StartGame";

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
    UpdateAvailableIconsCommand,
    UpdatePlayerSetupCommand,
    StartGameCommand
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
            setPlayingPlayers(obj.sizeOfPlayers);
        }

        switch (obj.command) {
            // Handles the event when the player leaves when the game is on. It updates the value of
            // number of people playing and rearranges the position
            // of players depending on IDs
            case (informLeavingCommand):
                if (playingTable.hidden == false) {

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
            // game to join the playing room. This statement displays number of playing players and displays
            // each players position on the table
            case (joinGameCommand):
                setPlayerID(obj.playerID);

                view.setID(id);
                view.setTotalPlayers(nPlayers);
                view.setCreator(obj.isCreator);
                view.setTotalPlayersPlaying(nPlayersPlaying);
                view.gameInProgress = true;

                if (obj.isCreator) {
                    view.loadGameSettingMenu();
                } else {
                    view.displayMenu();
                }
                break;
            case (UpdateGameProcessCommand):
                view.updateGameView(obj.gameView);
                view.displayStateOfTheGame();
                break;
            case (setTotalPlayersCommand):
                view.setTotalPlayers(nPlayers);
                view.setTotalPlayersPlaying(nPlayersPlaying);
                view.gameInProgress = obj.gameInProgress;
                view.updatePlayingStatus(obj.isPlaying);
                break;
            case (UpdateAvailableIconsCommand):
                view.updateAvailableIcons(obj.availableIcons);
                view.updateReadyPlayers(obj.readyPlayers);
                if (view.state == State.PlayerSetup) {
                    view.loadPlayerSetupPage();
                } else if (view.state == State.WaitingRoom) {
                    view.loadWaitingRoomPage();
                }
                break;
            case (UpdatePlayerSetupCommand):
                if (!obj.playerSetupOK) {
                    view.loadPlayerSetupPage();
                    alert("The user name is already taken. Try another one.");
                } else {
                    // Move to the waiting room
                    view.switchPages(State.WaitingRoom);
                }
                break;
            case (IllegalCommand):
                view.displayMessage("illegal", false, 'white', 'white');
                break;
            case (WaitCommand):
                view.displayMessage("wait", false, 'white', 'white');
                break;
            case (TakeCardsCommand):
                view.updateGameView(obj.gameView);
                view.displayStateOfTheGame();
                view.displayMessage("takeCards", false, 'white', 'white');
                break;
            case (TookCardsCommand):
                view.displayMessage("tookCards", false, 'white', 'white');
                break;
            case (StartGameCommand):
                view.updateGameView(obj.gameView);
                view.displayStateOfTheGame();
                break;
        }
    } else {
        console.log("Unknown command from the server");
    }
};

function updateState(): void {
    function disable() {
        view.removeTable();
    }
    function enable() {
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
