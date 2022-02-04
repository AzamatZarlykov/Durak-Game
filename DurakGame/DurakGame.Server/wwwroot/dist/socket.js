import { GameView } from './gameView.js';
import { State } from './helper.js';
let socket;
let connectionUrl;
let scheme = document.location.protocol === "https:" ? "wss" : "ws";
let port = document.location.port ? (":" + document.location.port) : "";
let id; // id of the player 
let nPlayers = 0; // total number of players on the webpage
let nPlayersPlaying = 0; // total number of players playing on the table
let JoinGameCommand = "JoinGame";
let SetTotalPlayersCommand = "SetTotalPlayers";
let UpdateGameProcessCommand = "UpdateGameProcess";
let IllegalCommand = "Illegal";
let WaitCommand = "Wait";
let TakeCardsCommand = "TakeCards";
let TookCardsCommand = "TookCards";
let UpdateAvailableIconsCommand = "UpdateAvailableIcons";
let UpdatePlayerSetupCommand = "UpdatePlayerSetup";
let StartGameCommand = "StartGame";
let ExtraCardCommand = "ExtraCard";
let GameIsAlreadyOverCommand = "GameIsAlreadyOver";
let ResetSuccessCommand = "ResetSuccess";
let PassportViolationCommand = "PassportViolation";
let UseDisplayButtonCommand = "UseDisplayButton";
let TerminateGameCommand = "Terminate";
let view;
let allCommands = [
    JoinGameCommand,
    SetTotalPlayersCommand,
    UpdateGameProcessCommand,
    IllegalCommand,
    WaitCommand,
    TakeCardsCommand,
    TookCardsCommand,
    UpdateAvailableIconsCommand,
    UpdatePlayerSetupCommand,
    StartGameCommand,
    ExtraCardCommand,
    GameIsAlreadyOverCommand,
    ResetSuccessCommand,
    PassportViolationCommand,
    UseDisplayButtonCommand,
    TerminateGameCommand
];
connectionUrl = scheme + "://" + document.location.hostname + port + "/ws";
socket = new WebSocket(connectionUrl);
socket.onopen = function (event) {
    view = new GameView(socket);
    updateState();
};
socket.onclose = function (event) {
    updateState();
};
socket.onerror = updateState;
socket.onmessage = function (event) {
    let obj = JSON.parse(event.data);
    if (allCommands.indexOf(obj.command) > -1) {
        if ([SetTotalPlayersCommand, JoinGameCommand].includes(obj.command)) {
            setTotalPlayers(obj.totalPlayers);
            setPlayingPlayers(obj.sizeOfPlayers);
        }
        switch (obj.command) {
            case (JoinGameCommand):
                setPlayerID(obj.playerID);
                view.gameStatus = obj.gameStatus;
                view.setID(id);
                view.updatePlayingStatus(obj.isPlaying);
                view.setCreator(obj.isCreator);
                view.setTotalPlayersPlaying(nPlayersPlaying);
                break;
            case (StartGameCommand):
                view.updateGameView(obj.gameView);
                view.setUserNames(obj.playerUserNames);
                view.setTakenIcons(obj.takenIcons);
                view.switchPages(State.GameTable, false);
                break;
            case (UpdateGameProcessCommand):
                view.updateGameView(obj.gameView);
                view.displayStateOfTheGame();
                break;
            case (SetTotalPlayersCommand):
                view.setTotalPlayers(nPlayers);
                view.gameStatus = obj.gameStatus;
                break;
            case (UpdateAvailableIconsCommand):
                view.updateAvailableIcons(obj.availableIcons);
                view.updateReadyPlayers(obj.readyPlayers);
                if (view.state == State.PlayerSetup) {
                    view.loadPlayerSetupPage();
                }
                else if (view.state == State.WaitingRoom) {
                    view.loadWaitingRoomPage();
                }
                break;
            case (UpdatePlayerSetupCommand):
                if (!obj.playerSetupOK) {
                    view.loadPlayerSetupPage();
                    alert("The user name is already taken. Try another one.");
                }
                else {
                    // Move to the waiting room
                    view.switchPages(State.WaitingRoom, false);
                }
                break;
            case (IllegalCommand):
                view.displayMessage("illegal", false, 'white', 'white');
                break;
            case (WaitCommand):
                view.displayMessage("wait", false, 'white', 'white');
                break;
            case (TakeCardsCommand):
                view.storePreviousBoutState();
                view.updateGameView(obj.gameView);
                view.displayStateOfTheGame();
                view.displayMessage("takeCards", false, 'white', 'white');
                break;
            case (TookCardsCommand):
                view.displayMessage("tookCards", false, 'white', 'white');
                break;
            case (ExtraCardCommand):
                view.displayMessage("extraCard", false, 'white', 'white');
                break;
            case (GameIsAlreadyOverCommand):
                view.displayMessage("gameIsAlreadyOver", false, 'white', 'white');
                break;
            case (ResetSuccessCommand):
                view.backToLobby();
                break;
            case (PassportViolationCommand):
                view.displayMessage("passport", false, 'white', 'white');
                break;
            case (UseDisplayButtonCommand):
                view.displayMessage("displayPassport", false, 'white', 'white');
                break;
            case (TerminateGameCommand):
                view.backToLobby();
                break;
        }
    }
    else {
        console.log("Unknown command from the server");
    }
};
function updateState() {
    function disable() {
        view.removeTable();
    }
    function enable() {
        view.displayMenu();
    }
    if (!socket) {
        disable();
    }
    else {
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
function setPlayingPlayers(count) {
    nPlayersPlaying = count;
}
/*
Sets the total number of players on html
*/
function setTotalPlayers(count) {
    nPlayers = count;
}
/*
Sets the player ID on html
*/
function setPlayerID(identifier) {
    id = identifier;
}
//# sourceMappingURL=socket.js.map