import { View } from './view.js';
let playingTable = document.getElementById("playingTable");
let startButton = document.getElementById("startGameButton");
let socket;
let connectionUrl;
let scheme = document.location.protocol === "https:" ? "wss" : "ws";
let port = document.location.port ? (":" + document.location.port) : "";
let id; // id of the player 
let nPlayers; // total number of players on the webpage
let nPlayersPlaying; // total number of players playing on the table
let informLeavingCommand = "InformLeaving";
let joinGameCommand = "JoinGame";
let requestStateGameCommand = "RequestStateGame";
let setTotalPlayersCommand = "SetTotalPlayers";
let view = new View();
let allCommands = [
    informLeavingCommand,
    joinGameCommand,
    requestStateGameCommand,
    setTotalPlayersCommand,
];
connectionUrl = scheme + "://" + document.location.hostname + port + "/ws";
socket = new WebSocket(connectionUrl);
socket.onopen = function (event) {
    updateState();
};
socket.onclose = function (event) {
    updateState();
};
socket.onerror = updateState;
socket.onmessage = function (event) {
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
                        view.displayPlayers(id, nPlayersPlaying);
                    }
                    else {
                        // when 1 person left the game is over. Close the board and tell server that game
                        // has finished
                        view.removeTable();
                        // no players playing
                        setPlayingPlayers(0);
                        console.log("The game is over");
                    }
                    console.log("Player " + obj.leavingPlayerID + " left the game");
                }
                else {
                    console.log("Player" + obj.leavingPlayerID + " left the server");
                }
                break;
            // When any player starts the game, the server sends this message to all the players in the 
            // game to join the playing room. This statement displays number of playing players and displays
            // each players position on the table
            case (joinGameCommand):
                console.log("Game started");
                console.log(obj);
                console.log(obj.gameView.hand);
                setPlayerID(obj.playerID);
                setPlayingPlayers(obj.sizeOfPlayers);
                view.drawTable();
                view.displayPlayers(id, nPlayersPlaying);
                break;
            // Handles the message about the state of the game from the server
            case (requestStateGameCommand):
                if (obj.command == requestStateGameCommand) {
                    if (!obj.gameState) {
                        let data = constructJSONPayload("StartGame");
                        socket.send(data);
                    }
                    else {
                        console.log("Game is already being played");
                    }
                }
                break;
        }
    }
    else {
        console.log("Unknown command from the server");
    }
};
startButton.onclick = function () {
    if (nPlayers > 1) {
        let data = constructJSONPayload(requestStateGameCommand);
        socket.send(data);
    }
    else {
        console.log("Not enough people on the server to play");
    }
};
function updateState() {
    function disable() {
        startButton.disabled = true;
        view.removeTable();
    }
    function enable() {
        startButton.disabled = false;
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
    console.log("Number Of Players In The Game: " + nPlayersPlaying);
}
/*
Returns the JSON object that containts the message to the server
*/
function constructJSONPayload(message) {
    return JSON.stringify({
        From: id,
        Message: message,
    });
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
    console.log("ID of the player is: " + id);
}
//# sourceMappingURL=socket.js.map