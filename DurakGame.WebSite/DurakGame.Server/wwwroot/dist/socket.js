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
let gameInProgress; // tells if the game is on 
let setIdCommand = "SetPlayerID";
let informLeavingCommand = "InformLeaving";
let informJoiningCommand = "InformJoining";
let joinGameCommand = "JoinGame";
let goodByeCommand = "Goodbye";
let requestStateGameCommand = "RequestStateGame";
let gameOverCommand = "GameOver";
let existingPlayers = [];
let allCommands = [
    gameOverCommand,
    setIdCommand,
    informLeavingCommand,
    informJoiningCommand,
    joinGameCommand,
    goodByeCommand,
    requestStateGameCommand
];
let serverCommands = [
    setIdCommand,
    informLeavingCommand,
    informJoiningCommand,
    joinGameCommand,
    requestStateGameCommand
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
        if (serverCommands.indexOf(obj.command) > -1) {
            // setIdCommand, informJoiningCommand, informLeavingCommand commands update the list of
            // players in the game. This if statement will handle the updating the value of the array
            if ([setIdCommand, informJoiningCommand, informLeavingCommand].includes(obj.command)) {
                existingPlayers = obj.allPlayersIDs;
                // Each server command updates the nPlayers(number of players in the game)
                setTotalPlayers(obj.totalPlayers);
            }
            if (obj.command == setIdCommand) {
                SetPlayerID(obj.playerID);
            }
            // notify other players who just joined
            if (obj.command == informJoiningCommand) {
                console.log("Player " + obj.playerID + " joined");
            }
            // Handles the event when the player leaves when the game is on. It updates the value of
            // number of people playing and rearranges the position
            // of players depending on IDs
            if (obj.command == informLeavingCommand) {
                if (playingTable.hidden == false) {
                    nPlayersPlaying -= 1;
                    if (nPlayersPlaying > 1) {
                        setTotalPlayingPlayers(nPlayersPlaying);
                        displayPlayersPositionsAroundTable(true);
                    }
                    else {
                        // when 1 person left the game is over. Close the board and tell server that game
                        // has finished
                        stopDisplayGame();
                        let data = constructJSONPayload(gameOverCommand);
                        socket.send(data);
                    }
                    console.log("Player " + obj.leavingPlayerID + " left the game");
                }
                else {
                    console.log("Player" + obj.leavingPlayerID + " left the server");
                }
            }
            // When any player starts the game, the server sends this message to all the players in the 
            // game to join the playing room. This statement displays number of playing players and displays
            // each players position on the table
            if (obj.command == joinGameCommand) {
                console.log("Game started");
                console.log("Player " + obj.from + " started the game");
                setTotalPlayingPlayers(obj.totalPlayers);
                displayGame();
                displayPlayersPositionsAroundTable(false);
            }
            // Handles the message about the state of the game from the server
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
        }
        // before leaving the server, every plyers receieves the message and updates the number of
        // players on the server
        else if (obj.command == goodByeCommand) {
            setTotalPlayers(obj.totalPlayers);
            socket.close(1000, "Closing from client");
        }
        // Game is over
        else if (obj.command == gameOverCommand) {
            gameInProgress = false;
            console.log("Game is over");
        }
    }
    else {
        console.log("Unknown command from the server");
    }
};
startButton.onclick = function () {
    if (nPlayers < 2) {
        console.log("Not enough players to play the game");
    }
    else {
        requestIfGameIsOn();
    }
};
function requestIfGameIsOn() {
    let data = constructJSONPayload(requestStateGameCommand);
    socket.send(data);
}
/*
Displays the table and the current number of
players joined to the game
*/
function displayGame() {
    playingTable.hidden = false;
}
/*
Stops displaying the table and the current number of
players joined to the game
*/
function stopDisplayGame() {
    playingTable.hidden = true;
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
function setTotalPlayingPlayers(count) {
    nPlayersPlaying = count;
    console.log("Number Of Players In The Game: " + nPlayersPlaying);
}
/*
places players in the right positions based on the folowing information:
number of players: nPlayersPlaying, list of existing players: existingPlayers,
list of positions avaliable: it is passed as an argument.
*/
function placePlayers(newDiv, className, pos) {
    let names = shuffle();
    for (let i = 0; i < nPlayersPlaying - 1; i++) {
        tag = document.createElement("p");
        tag.setAttribute("id", className.trim().concat(pos[i].toString()));
        setHTMLForPlayers(names[i], newDiv, className);
    }
}
/*
function sets the html elements for each of the player on the table.
Each of their ID correcsponds with the CSS style that place players
around the table.
*/
function setHTMLForPlayers(player, newDiv, className) {
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
        if (existingPlayers[i] > id) {
            result1.push(existingPlayers[i]);
        }
        if (existingPlayers[i] < id) {
            result2.push(existingPlayers[i]);
        }
    }
    return result1.concat(result2);
}
/*
displays the players around the table. The bool redraw is responsible
if function should delete previous div element of players and add new
div with updated number of elements
*/
function displayPlayersPositionsAroundTable(redraw) {
    if (redraw) {
        let obj = document.getElementById("playerIDTable");
        obj.remove();
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
        placePlayers(newDiv, className, [4]);
    }
    else if (nPlayersPlaying == 3) {
        placePlayers(newDiv, className, [3, 5]);
    }
    else if (nPlayersPlaying == 4) {
        placePlayers(newDiv, className, [3, 4, 5]);
    }
    else if (nPlayersPlaying == 5) {
        placePlayers(newDiv, className, [2, 3, 5, 6]);
    }
    else if (nPlayersPlaying == 6) {
        placePlayers(newDiv, className, [2, 3, 4, 5, 6]);
    }
}
// Displays the main player
function displayMainPlayer(newDiv) {
    let mainID = "Player1";
    var tag = document.createElement("p");
    let className = "Player ";
    tag.setAttribute("id", mainID);
    tag.className = className.trim();
    var text = document.createTextNode(className + id);
    tag.appendChild(text);
    newDiv.appendChild(tag);
}
/*
Returns the JSON object that containts the message to the server
*/
function constructJSONPayload(message = "Leaving") {
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
    console.log("Total Number Of Players: " + count.toString());
}
/*
Sets the player ID on html
*/
function SetPlayerID(identifier) {
    id = identifier;
    console.log("ID of the player is: " + id.toString());
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