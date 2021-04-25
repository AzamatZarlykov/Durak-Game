var connectionUrl = document.getElementById("connectionUrl");
var connectButton = document.getElementById("connectButton");
var connectedPeople = document.getElementById("connectedPeople");
var closeButton = document.getElementById("closeButton");

connectionUrl.value = "ws://localhost:5000";

connectButton.onclick = function() {
    socket = new WebSocket(connectionUrl.value);
    socket.onopen = function (event) {
        updateState();
    };

    socket.onclose = function (event) {
        updateState();
    };

    socket.onerror = updateState;
}

function updateState() {
    var value = parseInt(connectedPeople.length.value, 10);
    value++;
    connectedPeople.value = value
}