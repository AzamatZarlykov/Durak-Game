var connectionUrl = document.getElementById("connectionUrl");
var connectButton = document.getElementById("connectButton");
var stateLabel = document.getElementById("stateLabel");
var sendMessage = document.getElementById("sendMessage");
var sendButton = document.getElementById("sendButton");
var commsLog = document.getElementById("commsLog");
var closeButton = document.getElementById("closeButton");
var playerID = document.getElementById("playerIdLabel");
var totalPlayers = document.getElementById("totalNumberOfPlayers");
var recipient = document.getElementById("recipients");

let allPlayers;

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
        if(event.data.substring(0,9) == "PlayerID:") {
            commsLog.innerHTML += '<tr>' +
            '<td class="commslog-server">Server</td>' +
            '<td class="commslog-client">Client</td>' +
            '<td class="commslog-data">' + htmlEscape(event.data) + '</td></tr>';
            isPlayerID(event.data);
        }else {
            allPlayers = event.data;
            setTotalPlayers(event.data);
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
    var data = constructJSON();
    socket.send(data);
    commsLog.innerHTML += '<tr>' +
        '<td class="commslog-client">Client</td>' +
        '<td class="commslog-server">Server</td>' +
        '<td class="commslog-data">' + htmlEscape(data) + '</td></tr>';
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
    playerID.innerHTML = "PlayerID: " + str.substring(10, str.length);
}

function setTotalPlayers(str) {
    allPlayers = str
    totalPlayers.innerHTML = "Total Number Of Players: " + allPlayers;
}

function constructJSON() {
    return JSON.stringify({
        "From" : playerID.innerHTML.substring(10, playerID.innerHTML.length),
        "To" : recipients.value,
        "Message" : sendMessage.value
    });
}

function updateState() {
    function disable() {
        sendMessage.disabled = true;
        sendButton.disabled = true;
        closeButton.disabled = true;
        recipient.disabled = true;
    }
    function enable() {
        sendMessage.disabled = false;
        sendButton.disabled = false;
        closeButton.disabled = false;
        recipient.disabled = false;
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




// var numberOfPlayers = document.getElementById('number').value;

// socket = new WebSocket("ws://localhost:1234")
// socket.onopen = function (event) {
//     updateState();
//     socket.send("Message From The Client");
// };

// function updateState() {
//     var computerScore = document.getElementById('computerScore');
//     var number = computerScore.innerHTML;
//     number++;
//     computerScore.innerHTML = number;
// }
