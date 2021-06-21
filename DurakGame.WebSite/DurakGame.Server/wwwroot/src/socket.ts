let stateLabel = document.getElementById("stateLabel") as HTMLParagraphElement;
let sendMessage = document.getElementById("sendMessage") as HTMLInputElement;
let sendButton = document.getElementById("sendButton") as HTMLButtonElement;
let commsLog = document.getElementById("commsLog") as HTMLTableElement;
let playersPlaying = document.getElementById("playersPlaying") as HTMLParagraphElement;
let playingTable = document.getElementById("playingTable") as HTMLDivElement;
let totalPlayers = document.getElementById("totalNumberOfPlayers") as HTMLParagraphElement;
let playerID = document.getElementById("playerIdLabel") as HTMLParagraphElement;
let recipients = document.getElementById("recipients") as HTMLInputElement;
let startButton = document.getElementById("startGameButton") as HTMLButtonElement;

let socket: WebSocket;
let connectionUrl: string;

let tag: HTMLParagraphElement;
let text;
let className: string = "Player ";

let scheme: string = document.location.protocol === "https:" ? "wss" : "ws";
let port: string = document.location.port ? (":" + document.location.port) : "";

let id: number;
let nPlayers: number;
let nPlayersPlaying: number;

let setIdCommand: string= "SetPlayerID";
let informLeavingCommand: string = "InformLeaving";
let informJoiningCommand: string = "InformJoining";
let joinGameCommand: string = "JoinGame";
let userMessageCommand: string = "UserMessage";
let userMessageCommandPrivate: string = "UserMessagePrivate";
let goodByeCommand: string = "Goodbye";
let endGameCommand: string = "EndGame";

let existingPlayers : number[] = [];

let allCommands: string[] = [
    endGameCommand,
    setIdCommand,
    informLeavingCommand,
    informJoiningCommand,
    joinGameCommand,
    userMessageCommand,
    userMessageCommandPrivate,
    goodByeCommand,
];

let serverCommands: string[] = [
    setIdCommand,
    informLeavingCommand,
    informJoiningCommand,
    joinGameCommand,
];

connectionUrl = scheme + "://" + document.location.hostname + port + "/ws";

stateLabel.innerHTML = "Connecting";
socket = new WebSocket(connectionUrl);

socket.onopen = function (event) : void{
    updateState();
    commsLog.innerHTML += '<tr>' +
        '<td colspan="3" class="commslog-data">Connection opened</td>' +
        '</tr>';
};
socket.onclose = function (event) : void{
    updateState();
    commsLog.innerHTML += '<tr>' +
        '<td colspan="3" class="commslog-data">Connection closed. Code: ' +
        htmlEscape(event.code.toString()) + '. Reason: ' + htmlEscape(event.reason) + '</td>' +
        '</tr>';
};
socket.onerror = updateState;

socket.onmessage = function (event) : void {
    let obj = JSON.parse(event.data);

    if (allCommands.indexOf(obj.command) > -1) {
        if (serverCommands.indexOf(obj.command) > -1) {
            // Outputs the messages on the log depending on the command
            commslogServerHtml(obj);

            if (obj.command != joinGameCommand) {
                nPlayers = obj.totalPlayers;
            }
            else if (obj.command == joinGameCommand) {
                setTotalPlayingPlayers(nPlayers);
                displayGame();
                displayPlayersPositionsAroundTable(false);
            }
            if (obj.command == informLeavingCommand) {
                existingPlayers = obj.allPlayersIDs;
            }
            if (
                obj.command == informLeavingCommand &&
                playingTable.hidden == false
            ) {
                nPlayersPlaying -= 1;
                setTotalPlayingPlayers(nPlayersPlaying);
                displayPlayersPositionsAroundTable(true);
            }
            if (obj.command == informJoiningCommand) {
                existingPlayers = obj.allPlayersIDs;
            }
            if (obj.command == setIdCommand) {
                isPlayerID(obj.playerID);
                existingPlayers = obj.allPlayersIDs;
            }
            setTotalPlayers(nPlayers);
        }
        else if (
            obj.command == userMessageCommand ||
            obj.command == userMessageCommandPrivate
        ) {
            commslogMessageHtml(obj);
        }
        else if (obj.command == goodByeCommand) {
            setTotalPlayers(obj.totalPlayers);
            socket.close(1000, "Closing from client");
        }
        else if (obj.command == endGameCommand) {
            commslogEndGame();
        }
    } else {
        console.log("Unknown command from the server");
    }
};

sendButton.onclick = function () : void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("socket not connected");
    }
    let data: string = constructJSONPayload(sendMessage.value);
    let parsedData = JSON.parse(data);
    let toSomeone: boolean = parsedData.To == 0 ? false : true;

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

/*
Displays the table and the current number of 
players joined to the game
*/
function displayGame() : void {
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

function updateState() : void {
    function disable() {
        sendMessage.disabled = true;
        sendButton.disabled = true;
        recipients.disabled = true;
        startButton.disabled = true;
    }
    function enable() {
        sendMessage.disabled = false;
        sendButton.disabled = false;
        recipients.disabled = false;
        startButton.disabled = false;
    }

    if (!socket) {
        disable();
    } else {
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
function commslogServerHtml(jsonObj) : void {
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

// Outputs on CommsLog the messages public or private
function commslogMessageHtml(jsonObj) : void {
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
function setTotalPlayingPlayers(count : number) : void {
    nPlayersPlaying = count;
    playersPlaying.innerHTML =
        "Number Of Players In The Game: " + nPlayersPlaying;
}

/*
places players in the right positions based on the folowing information:
number of players: nPlayersPlaying, list of existing players: existingPlayers, 
list of positions avaliable: it is passed as an argument. 
*/
function placePlayers(newDiv:HTMLDivElement, className:string, pos:number[]) : void {
    let names : number[] = shuffle();
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
function setHTMLForPlayers(player: number, newDiv: HTMLDivElement, className: string) : void{
    text = document.createTextNode(className.concat(player.toString()));
    tag.className = className.trim();
    tag.appendChild(text);
    newDiv.appendChild(tag);
}

/*
Shuffle positions according to the ID of the player.
E.g the playerID = 3 then the output list is [4,5,6,1,2]
*/
function shuffle() : number[] {
    let result1: number[] = [];
    let result2: number[] = [];
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
function displayPlayersPositionsAroundTable(redraw : boolean) : void {
    if (redraw) {
        let obj = document.getElementById("playerIDTable");
        obj.remove();
    }

    const playerDiv = document.createElement("div") as HTMLDivElement;
    playerDiv.setAttribute("id", "playerIDTable");
    playerDiv.className = "playerTable";

    // Display the main player 
    displayMainPlayer(playerDiv);

    // Display other players 
    if (nPlayersPlaying > 1) {
        displayOtherPlayers(playerDiv);
    }

    let table = document.getElementById("playingTable") as HTMLDivElement;
    table.appendChild(playerDiv);
}

// Determines the placing based on number of players
function displayOtherPlayers(newDiv : HTMLDivElement) : void {
    if (nPlayersPlaying == 2) {
        placePlayers(newDiv, className, [4]);
    } else if (nPlayersPlaying == 3) {
        placePlayers(newDiv, className, [3, 5]);
    } else if (nPlayersPlaying == 4) {
        placePlayers(newDiv, className, [3, 4, 5]);
    } else if (nPlayersPlaying == 5) {
        placePlayers(newDiv, className, [2, 3, 5, 6]);
    } else if (nPlayersPlaying == 6) {
        placePlayers(newDiv, className, [2, 3, 4, 5, 6]);
    }
}

// Displays the main player
function displayMainPlayer(newDiv:HTMLDivElement) : void {
    var mainID = "Player1";
    var tag = document.createElement("p");
    var className = "Player ";
    tag.setAttribute("id", mainID);
    tag.className = className.trim();

    var text = document.createTextNode(className + id);

    tag.appendChild(text);
    newDiv.appendChild(tag);
}

/*
Returns the JSON object that containts the message to the server
*/
function constructJSONPayload(message : string = "Leaving") : string{
    return JSON.stringify({
        From: parseInt(playerID.innerHTML.substring(10, playerID.innerHTML.length)),
        To: parseInt(recipients.value) || 0,
        Message: message,
    });
}

/*
Sets the total number of players on html
*/
function setTotalPlayers(count : number) {
    totalPlayers.innerHTML = "Total Number Of Players: " + count.toString();
}

/*
Sets the player ID on html
*/
function isPlayerID(_id : number) : void {
    playerID.innerHTML = "PlayerID: " + _id;
    id = _id;
}

function htmlEscape(str: string) : string {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}