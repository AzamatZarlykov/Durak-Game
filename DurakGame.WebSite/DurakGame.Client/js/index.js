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

let nPlayers;
let id;

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
        if(obj.command == "SetPlayerID") { 
            commsLog.innerHTML += '<tr>' +
            '<td class="commslog-server">Server</td>' +
            '<td class="commslog-client">Client</td>' + 
            '<td class="commslog-data"> Player ' +  htmlEscape(obj.playerID) + ' Connected</td></tr>'
            isPlayerID(obj.playerID);
        } else if (obj.command == "InformLeaving"){ 
            commsLog.innerHTML += '<tr>' +
            '<td class="commslog-server">Server</td>' +
            '<td class="commslog-client">Player ' + id +'</td>' + 
            '<td class="commslog-data"> Player ' +  htmlEscape(obj.leavingPlayerID) + ' Disconnected</td></tr>';
        } else if(obj.command == "InformJoining") {
            commsLog.innerHTML += '<tr>' +
            '<td class="commslog-server">Server</td>' +
            '<td class="commslog-client">Player ' + id +'</td>' + 
            '<td class="commslog-data"> Player ' +  htmlEscape(obj.playerID) + ' Joined The Game</td></tr>';
        } else if(obj.command.substring(0, 11) == "UserMessage") {
            commsLog.innerHTML += '<tr>' +
            (obj.command.substring(11, obj.command.length) == "Private" ? '<td class="commslog-server">(Private) Player ' + htmlEscape(obj.From) + '</td>' : 
            '<td class="commslog-server">Player ' + htmlEscape(obj.From) + '</td>') +
            '<td class="commslog-client">Player ' + id +'</td>' + 
            '<td class="commslog-data">' +  htmlEscape(obj.Message) + '</td></tr>';
        }
        if(obj.command.substring(0, 11) != "UserMessage") {
            setTotalPlayers(obj.totalPlayers);
        }
    };
};

closeButton.onclick = function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("socket not connected");
    }
    socket.close(1000, "Closing from client");
};

sendButton.onclick = function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("socket not connected");
    }
    var data = constructJSONPayload();
    var parsedData = JSON.parse(data);
    socket.send(data);
    commsLog.innerHTML += '<tr>' +
        '<td class="commslog-client">Player ' + id +'</td>' +
        '<td class="commslog-server">' + (parsedData.To == 0 ? 'Everyone' : 'Player ' + parsedData.To.toString()) +'</td>' +
        '<td class="commslog-data">' + parsedData.Message + '</td></tr>';
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

function constructJSONPayload() {
    return JSON.stringify({
        "From": parseInt(playerID.innerHTML.substring(10, playerID.innerHTML.length)),
        "To": parseInt(recipients.value) || 0,
        "Message": sendMessage.value
    });
}

function updateState() {
    function disable() {
        sendMessage.disabled = true;
        sendButton.disabled = true;
        closeButton.disabled = true;
        recipients.disabled = true;
    }
    function enable() {
        sendMessage.disabled = false;
        sendButton.disabled = false;
        closeButton.disabled = false;
        recipients.disabled = false;
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
                // setTotalPlayers(parseInt(nPlayers)-1);
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