let stateLabel = document.getElementById("stateLabel");
let sendMessage = document.getElementById("sendMessage");
let sendButton = document.getElementById("sendButton");
let commsLog = document.getElementById("commsLog");
let playersPlaying = document.getElementById("playersPlaying");
let playingTable = document.getElementById("playingTable");
let totalPlayers = document.getElementById("totalNumberOfPlayers");
let playerID = document.getElementById("playerIdLabel");
let recipients = document.getElementById("recipients");
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
let userMessageCommand = "UserMessage";
let userMessageCommandPrivate = "UserMessagePrivate";
let goodByeCommand = "Goodbye";
let startGameCommand = "StartGame";
let requestStateGameCommand = "RequestStateGame";
let gameOverCommand = "GameOver";
let existingPlayers = [];
let allCommands = [
    gameOverCommand,
    setIdCommand,
    informLeavingCommand,
    informJoiningCommand,
    joinGameCommand,
    userMessageCommand,
    userMessageCommandPrivate,
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
stateLabel.innerHTML = "Connecting";
socket = new WebSocket(connectionUrl);
socket.onopen = function (event) {
    updateState();
    commsLog.innerHTML += '<tr>' +
        '<td colspan="3" class="commslog-data">Connection opened</td>' +
        '</tr>';
};
socket.onclose = function (event) {
    updateState();
    commsLog.innerHTML += '<tr>' +
        '<td colspan="3" class="commslog-data">Connection closed. Code: ' +
        htmlEscape(event.code.toString()) + '. Reason: ' + htmlEscape(event.reason) + '</td>' +
        '</tr>';
};
socket.onerror = updateState;
socket.onmessage = function (event) {
    let obj = JSON.parse(event.data);
    if (allCommands.indexOf(obj.command) > -1) {
        if (serverCommands.indexOf(obj.command) > -1) {
            // Outputs the messages on the log depending on the command
            commslogServerHtml(obj);
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
            // Handles the event when the player leaves when the game is on. It updates the value of
            // number of people playing and rearranges the position
            // of players depending on IDs
            if (obj.command == informLeavingCommand && playingTable.hidden == false) {
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
            }
            // When any player starts the game, the server sends this message to all the players in the 
            // game to join the playing room. This statement displays number of playing players and displays
            // each players position on the table
            if (obj.command == joinGameCommand) {
                setTotalPlayingPlayers(obj.totalPlayers);
                displayGame();
                displayPlayersPositionsAroundTable(false);
            }
            // Handles the message about the state of the game from the server
            if (obj.command == requestStateGameCommand) {
                gameInProgress = obj.gameState;
                if (!gameInProgress) {
                    let data = constructJSONPayload(startGameCommand);
                    socket.send(data);
                }
                else {
                    console.log("Game is already being played");
                }
            }
        }
        else if (obj.command == userMessageCommand || obj.command == userMessageCommandPrivate) {
            commslogMessageHtml(obj);
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
            commslogEndGame();
        }
    }
    else {
        console.log("Unknown command from the server");
    }
};
sendButton.onclick = function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("socket not connected");
    }
    let data = constructJSONPayload(sendMessage.value);
    let parsedData = JSON.parse(data);
    let toSomeone = parsedData.To == 0 ? false : true;
    socket.send(data);
    commsLog.innerHTML +=
        "<tr>" +
            (toSomeone
                ? '<td class="commslog-client">(Private)Player ' + id + "</td>"
                : '<td class="commslog-client">Player ' + id + "</td>") +
            '<td class="commslog-server">' +
            (!toSomeone ? "Everyone" : "Player " + parsedData.To.toString()) +
            "</td>" +
            '<td class="commslog-data">' +
            parsedData.Message +
            "</td></tr>";
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
    playersPlaying.hidden = false;
}
/*
Stops displaying the table and the current number of
players joined to the game
*/
function stopDisplayGame() {
    playingTable.hidden = true;
    playersPlaying.hidden = true;
}
function updateState() {
    function disable() {
        sendMessage.disabled = true;
        sendButton.disabled = true;
        recipients.disabled = true;
        startButton.disabled = true;
        stopDisplayGame();
    }
    function enable() {
        sendMessage.disabled = false;
        sendButton.disabled = false;
        recipients.disabled = false;
        startButton.disabled = false;
    }
    if (!socket) {
        disable();
    }
    else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                stateLabel.innerHTML = "Closed";
                disable();
                break;
            case WebSocket.CLOSING:
                stateLabel.innerHTML = "Closing...";
                disable();
                break;
            case WebSocket.CONNECTING:
                stateLabel.innerHTML = "Connecting...";
                disable();
                break;
            case WebSocket.OPEN:
                stateLabel.innerHTML = "Open";
                enable();
                break;
            default:
                stateLabel.innerHTML = "Unknown WebSocket State: " +
                    htmlEscape(socket.readyState.toString());
                disable();
                break;
        }
    }
}
// Outputs on CommsLog all the information coming from the server
function commslogServerHtml(jsonObj) {
    if (jsonObj.command != requestStateGameCommand) {
        commsLog.innerHTML +=
            "<tr>" +
                '<td class="commslog-server">Server</td>' +
                '<td class="commslog-client">' +
                (jsonObj.command == setIdCommand ? "Client" : "Player " + id) +
                "</td>" +
                '<td class="commslog-data"> Player ' +
                (jsonObj.command == informLeavingCommand
                    ? htmlEscape(jsonObj.leavingPlayerID)
                    : jsonObj.command == joinGameCommand
                        ? htmlEscape(jsonObj.From)
                        : htmlEscape(jsonObj.playerID)) +
                " " +
                (jsonObj.command == setIdCommand
                    ? "connected"
                    : jsonObj.command == informLeavingCommand
                        ? "disconnected"
                        : jsonObj.command == joinGameCommand
                            ? "started the game"
                            : "joined the game") +
                "</td></tr>";
    }
}
// Outputs on CommsLog the messages public or private
function commslogMessageHtml(jsonObj) {
    commsLog.innerHTML +=
        "<tr>" +
            '<td class="commslog-server">' +
            (jsonObj.command == userMessageCommand ? "Player " : "(Private)Player ") +
            htmlEscape(jsonObj.From) +
            "</td>" +
            '<td class="commslog-client">Player ' +
            id +
            "</td>" +
            '<td class="commslog-data">' +
            htmlEscape(jsonObj.Message) +
            "</td></tr>";
}
// Output on CommsLog when the game is finished
function commslogEndGame() {
    commsLog.innerHTML +=
        "<tr>" +
            '<td class="commslog-server">Server</td>' +
            '<td class="commslog-client">Player ' +
            id +
            "</td>" +
            '<td class="commslog-data">' +
            "Game Over" +
            "</td></tr>";
}
/*
Sets the total number of players playing in the game on html
*/
function setTotalPlayingPlayers(count) {
    nPlayersPlaying = count;
    playersPlaying.innerHTML =
        "Number Of Players In The Game: " + nPlayersPlaying;
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
        From: parseInt(playerID.innerHTML.substring(10, playerID.innerHTML.length)),
        To: parseInt(recipients.value) || 0,
        Message: message,
    });
}
/*
Sets the total number of players on html
*/
function setTotalPlayers(count) {
    nPlayers = count;
    totalPlayers.innerHTML = "Total Number Of Players: " + count.toString();
}
/*
Sets the player ID on html
*/
function SetPlayerID(_id) {
    playerID.innerHTML = "PlayerID: " + _id;
    id = _id;
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