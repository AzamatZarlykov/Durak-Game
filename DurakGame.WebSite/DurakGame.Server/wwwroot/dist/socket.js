let playingTable = document.getElementById("playingTable");
let startButton = document.getElementById("startGameButton");
let socket;
let connectionUrl;
let tag;
let text;
let className = "Player ";
let scheme = document.location.protocol === "https:" ? "wss" : "ws";
let port = document.location.port ? (":" + document.location.port) : "";
let id; // id of the player 
let nPlayers; // total number of players on the webpage
let nPlayersPlaying; // total number of players playing on the table
let idsOfPlayers; // a list of player IDs
let gameInProgress; // tells if the game is on 
let informLeavingCommand = "InformLeaving";
let joinGameCommand = "JoinGame";
let requestStateGameCommand = "RequestStateGame";
let setTotalPlayersCommand = "SetTotalPlayers";
let allCommands = [
    informLeavingCommand,
    joinGameCommand,
    requestStateGameCommand,
    setTotalPlayersCommand
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
                    console.log("Before remove " + obj.leavingPlayerID + " from " + idsOfPlayers);
                    // remove the player left from the existing playing players
                    // so that players can be redistributed around the table.
                    removeFromPlayingPlayers(obj.leavingPlayerID);
                    console.log("After remove " + obj.leavingPlayerID + " from " + idsOfPlayers);
                    setPlayingPlayers(obj.sizeOfPlayers);
                    if (nPlayersPlaying > 1) {
                        setPlayingPlayers(nPlayersPlaying);
                        displayPlayersPositionsAroundTable(true);
                    }
                    else {
                        // when 1 person left the game is over. Close the board and tell server that game
                        // has finished
                        stopDisplayGame();
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
                setPlayerID(obj.playerID);
                setOtherPlayerIDs(); // if nPlayers = 5; then idsOfPlayers = [0,1,2,3,4]
                setPlayingPlayers(obj.sizeOfPlayers);
                displayGame();
                displayPlayersPositionsAroundTable(false);
                break;
            // Handles the message about the state of the game from the server
            case (requestStateGameCommand):
                if (obj.command == requestStateGameCommand) {
                    gameInProgress = obj.gameState;
                    if (!gameInProgress) {
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
/*
Displays the table and the current number of
players joined to the game
*/
function displayGame() {
    playingTable.hidden = false;
    gameInProgress = true;
}
/*
Stops displaying the table and the current number of
players joined to the game
*/
function stopDisplayGame() {
    // remove the previous players positions
    removeDOM("playerIDTable");
    playingTable.hidden = true;
    gameInProgress = false;
}
function updateState() {
    function disable() {
        startButton.disabled = true;
        stopDisplayGame();
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
places players in the right positions based on the folowing information:
number of players: nPlayersPlaying, list of existing players: existingPlayers,
list of positions avaliable: it is passed as an argument.
*/
function placePlayers(newDiv, pos) {
    let names = shuffle();
    for (let i = 0; i < nPlayersPlaying - 1; i++) {
        tag = document.createElement("p");
        tag.setAttribute("id", className.trim().concat(pos[i].toString()));
        setHTMLForPlayers(newDiv, names[i]);
    }
}
/*
function sets the html elements for each of the player on the table.
Each of their ID correcsponds with the CSS style that place players
around the table.
*/
function setHTMLForPlayers(newDiv, player) {
    text = document.createTextNode(className.concat(player.toString()));
    tag.className = className.trim();
    tag.appendChild(text);
    newDiv.appendChild(tag);
}
/*
Shuffle positions according to the ID of the player.
E.g the playerID = 3 then the output list is [4,5,6,1,2]
*/
function shuffle() {
    let result1 = [];
    let result2 = [];
    for (let i = 0; i < nPlayersPlaying; i++) {
        if (idsOfPlayers[i] > id) {
            result1.push(idsOfPlayers[i]);
        }
        if (idsOfPlayers[i] < id) {
            result2.push(idsOfPlayers[i]);
        }
    }
    return result1.concat(result2);
}
/*
function that removes the DOM from HTML.
argument, htmlID, the object that be removed
*/
function removeDOM(htmlID) {
    let obj = document.getElementById(htmlID);
    obj.remove();
}
/*
displays the players around the table. The bool redraw is responsible
if function should delete previous div element of players and add new
div with updated number of elements
*/
function displayPlayersPositionsAroundTable(redraw) {
    if (redraw) {
        removeDOM("playerIDTable");
    }
    const playerDiv = document.createElement("div");
    playerDiv.setAttribute("id", "playerIDTable");
    playerDiv.className = "playerTable";
    // Display the main player 
    displayMainPlayer(playerDiv);
    // Display other players 
    displayOtherPlayers(playerDiv);
    let table = document.getElementById("playingTable");
    table.appendChild(playerDiv);
}
// Determines the placing based on number of players
function displayOtherPlayers(newDiv) {
    if (nPlayersPlaying == 2) {
        placePlayers(newDiv, [4]);
    }
    else if (nPlayersPlaying == 3) {
        placePlayers(newDiv, [3, 5]);
    }
    else if (nPlayersPlaying == 4) {
        placePlayers(newDiv, [3, 4, 5]);
    }
    else if (nPlayersPlaying == 5) {
        placePlayers(newDiv, [2, 3, 5, 6]);
    }
    else if (nPlayersPlaying == 6) {
        placePlayers(newDiv, [2, 3, 4, 5, 6]);
    }
}
// Displays the main player
function displayMainPlayer(newDiv) {
    let mainID = "Player1";
    var tag = document.createElement("p");
    tag.setAttribute("id", mainID);
    tag.className = className.trim();
    var text = document.createTextNode(className + id);
    tag.appendChild(text);
    newDiv.appendChild(tag);
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
    console.log("ID of the player is: " + id.toString());
}
/*
Sets the list of ids of other players
*/
function setOtherPlayerIDs() {
    idsOfPlayers = Array.from(Array(nPlayers).keys());
}
/*
Remove the player from the existing playing players
based on the playerID
*/
function removeFromPlayingPlayers(idToDelete) {
    var index = idsOfPlayers.indexOf(idToDelete);
    // if the player left was playing splice the list
    // else do nothing
    if (index !== -1) {
        idsOfPlayers.splice(index, 1);
    }
}
function htmlEscape(str) {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
//# sourceMappingURL=socket.js.map