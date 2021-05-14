var connectionUrl = document.getElementById("connectionUrl");
var connectButton = document.getElementById("connectButton");
var stateLabel = document.getElementById("stateLabel");
var commsLog = document.getElementById("commsLog");
var closeButton = document.getElementById("closeButton");
var playerID = document.getElementById("playerIdLabel");
var totalPlayers = document.getElementById("totalNumberOfPlayers");
var sendMessage = document.getElementById("sendMessage");
var sendButton = document.getElementById("sendButton");
var recipients = document.getElementById("recipients");
var startButton = document.getElementById("startGameButton");

let nPlayers;
let id;

let setIdCommand = "SetPlayerID";
let informLeavingCommand = "InformLeaving";
let informJoiningCommand = "InformJoining";
let joinGameCommand = "JoinGame";
let userMessageCommand = "UserMessage";
let userMessageCommandPrivate = "UserMessagePrivate";
let goodByeCommand = "Goodbye";

let serverCommands = [setIdCommand, informLeavingCommand, informJoiningCommand, joinGameCommand];
let allCommands = [setIdCommand, informLeavingCommand, informJoiningCommand, joinGameCommand, userMessageCommand, userMessageCommandPrivate, goodByeCommand]

connectionUrl.value = "ws://localhost:1234";

connectButton.onclick = function () {
    stateLabel.innerHTML = "Attempting to connect...";
    socket = new WebSocket(connectionUrl.value);

    socket.onopen = function (event) {
        updateState(); 
        commsLog.innerHTML += '<tr>' +
            '<td colspan="3" class="commslog-data">Connection opened</td>' +
            '</tr>';
    };
    
    socket.onclose = function (event) {
        updateState();
        commsLog.innerHTML += '<tr>' +
            '<td colspan="3" class="commslog-data">Connection closed. Code: ' + htmlEscape(event.code) + '. Reason: ' + htmlEscape(event.reason) + '</td>' +
            '</tr>';
    };
    
    socket.onerror = updateState;
    
    socket.onmessage = function (event) {
        var obj = JSON.parse(event.data);
        
        if(allCommands.indexOf(obj.command) > - 1) {
            if(serverCommands.indexOf(obj.command) > - 1) {
                commslogServerHtml(obj)
                if(obj.command == setIdCommand) { 
                    isPlayerID(obj.playerID);
                }
                setTotalPlayers(nPlayers);
            } else if (obj.command == userMessageCommand || obj.command == userMessageCommandPrivate){ 
                commslogMessageHtml(obj);
            } else if(obj.command == goodByeCommand) {
                setTotalPlayers(obj.totalPlayers);
                socket.close(1000, "Closing from client");
            } 
        } else {
            console.log("Unknown command from the server");
        }
    };
};

function commslogMessageHtml(jsonObj) {
    commsLog.innerHTML += '<tr>' +
    '<td class="commslog-server">' + (jsonObj.command == userMessageCommand ? "Player " : "(Private)Player ") + htmlEscape(jsonObj.From) + '</td>' +
    '<td class="commslog-client">Player ' + id +'</td>' + 
    '<td class="commslog-data">' +  htmlEscape(jsonObj.Message) + '</td></tr>';
}

function commslogServerHtml (jsonObj) {
    if(jsonObj.command != joinGameCommand) {
        nPlayers = jsonObj.totalPlayers;
    }
    commsLog.innerHTML += '<tr>' +
        '<td class="commslog-server">Server</td>' +
        '<td class="commslog-client">' + (jsonObj.command == setIdCommand ? "Client" : "Player " + id) + '</td>' + 
        '<td class="commslog-data"> Player ' + (jsonObj.command == informLeavingCommand ? htmlEscape(jsonObj.leavingPlayerID) : 
        (jsonObj.command == joinGameCommand ? htmlEscape(jsonObj.From) : htmlEscape(jsonObj.playerID)))  + ' ' + 
        (jsonObj.command == setIdCommand ? "connected" : (jsonObj.command == informLeavingCommand ? "disconnected" : 
        (jsonObj.command == joinGameCommand ? "started the game" : "joined the game"))) + '</td></tr>'
}

closeButton.onclick = function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("socket not connected");
    }
    var data = constructJSONPayload();
    socket.send(data);
};

sendButton.onclick = function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("socket not connected");
    }
    var data = constructJSONPayload(sendMessage.value);
    var parsedData = JSON.parse(data);
    var toSomeone = parsedData.To == 0 ? false : true

    socket.send(data);

    commsLog.innerHTML += '<tr>' +
        (toSomeone ? '<td class="commslog-client">(Private)Player ' + id +'</td>' :
        '<td class="commslog-client">Player ' + id +'</td>') +
        '<td class="commslog-server">' + (!toSomeone ? 'Everyone' : 'Player ' + parsedData.To.toString()) +'</td>' +
        '<td class="commslog-data">' + parsedData.Message + '</td></tr>';
};

startButton.onclick = function () {
    var data = constructJSONPayload("startGame");
    socket.send(data);
};



function htmlEscape(str) {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function isPlayerID(str) {
    playerID.innerHTML = "PlayerID: " + str;
    id = str;
}

function setTotalPlayers(str) {
    totalPlayers.innerHTML = "Total Number Of Players: " + str;
}

function constructJSONPayload(message = "leaving") {
    return JSON.stringify({
        "From": parseInt(playerID.innerHTML.substring(10, playerID.innerHTML.length)),
        "To": parseInt(recipients.value) || 0,
        "Message": message
    });
}

function updateState() {
    function disable() {
        sendMessage.disabled = true;
        sendButton.disabled = true;
        closeButton.disabled = true;
        recipients.disabled = true;
        startButton.disabled = true;
    }
    function enable() {
        sendMessage.disabled = false;
        sendButton.disabled = false;
        closeButton.disabled = false;
        recipients.disabled = false;
        startButton.disabled = false;
    }
    connectionUrl.disabled = true;
    connectButton.disabled = true;
    if (!socket) {
        disable();
    } else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                stateLabel.innerHTML = "Closed";
                playerID.innerHTML = "PlayerID: N/a"  
                disable();
                connectionUrl.disabled = false;
                connectButton.disabled = false;
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
                stateLabel.innerHTML = "Unknown WebSocket State: " + htmlEscape(socket.readyState);
                disable();
                break;
        }
    }
}