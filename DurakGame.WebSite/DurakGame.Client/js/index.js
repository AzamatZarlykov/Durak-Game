// var numberOfPlayers = document.getElementById('number').value;

socket = new WebSocket("ws://localhost:1234")
socket.onopen = function (event) {
    updateState();
    socket.send("Message From The Client");
};

function updateState() {
    var computerScore = document.getElementById('computerScore');
    var number = computerScore.innerHTML;
    number++;
    computerScore.innerHTML = number;
}
