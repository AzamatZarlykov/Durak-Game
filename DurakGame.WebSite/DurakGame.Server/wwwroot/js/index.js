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
var playingTable = document.getElementById("playingTable");
var playersPlaying = document.getElementById("playersPlaying");

var tag;
var text;
var className = "Player ";

let id;
let nPlayers;
let nPlayersPlaying;

let setIdCommand = "SetPlayerID";
let informLeavingCommand = "InformLeaving";
let informJoiningCommand = "InformJoining";
let joinGameCommand = "JoinGame";
let userMessageCommand = "UserMessage";
let userMessageCommandPrivate = "UserMessagePrivate";
let goodByeCommand = "Goodbye";
let endGameCommand = "EndGame";

let serverCommands = [
  setIdCommand,
  informLeavingCommand,
  informJoiningCommand,
  joinGameCommand,
];
let allCommands = [
  endGameCommand,
  setIdCommand,
  informLeavingCommand,
  informJoiningCommand,
  joinGameCommand,
  userMessageCommand,
  userMessageCommandPrivate,
  goodByeCommand,
];

connectionUrl.value = "ws://localhost:5000";

connectButton.onclick = function () {
  stateLabel.innerHTML = "Attempting to connect...";
  socket = new WebSocket(connectionUrl.value);

  socket.onopen = function (event) {
    updateState();
    commsLog.innerHTML +=
      "<tr>" +
      '<td colspan="3" class="commslog-data">Connection opened</td>' +
      "</tr>";
  };

  socket.onclose = function (event) {
    updateState();
    commsLog.innerHTML +=
      "<tr>" +
      '<td colspan="3" class="commslog-data">Connection closed. Code: ' +
      htmlEscape(event.code) +
      ". Reason: " +
      htmlEscape(event.reason) +
      "</td>" +
      "</tr>";
  };

  socket.onerror = updateState;

  socket.onmessage = function (event) {
    var obj = JSON.parse(event.data);

    if (allCommands.indexOf(obj.command) > -1) {
      if (serverCommands.indexOf(obj.command) > -1) {
        commslogServerHtml(obj);

        if (obj.command != joinGameCommand) {
          nPlayers = obj.totalPlayers;
        } else if (obj.command == joinGameCommand) {
          setTotalPlayingPlayers(nPlayers);
          displayGame();
          displayPlayersPositionsAroundTable();
        } else if (obj.command == informLeavingCommand &&
          playingTable.hidden == false) {
          nPlayersPlaying -= 1;
          setTotalPlayingPlayers(nPlayersPlaying);
        }
        if (obj.command == setIdCommand) {
          isPlayerID(obj.playerID);
        }
        setTotalPlayers(nPlayers);
      } else if (obj.command == userMessageCommand ||
        obj.command == userMessageCommandPrivate) {
        commslogMessageHtml(obj);
      } else if (obj.command == goodByeCommand) {
        setTotalPlayers(obj.totalPlayers);
        socket.close(1000, "Closing from client");
      } else if (obj.command == endGameCommand) {
        commslogEndGame(obj);
      }
    } else {
      console.log("Unknown command from the server");
    }
  };
};

closeButton.onclick = function () {
  if (nPlayersPlaying == 1 && playingTable.hidden == false) {
    var data = constructJSONPayload("EndGame");
    socket.send(data);
  }
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
  var toSomeone = parsedData.To == 0 ? false : true;

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
  var data = constructJSONPayload("StartGame");
  socket.send(data);
};

function displayPlayersPositionsAroundTable() { 
    const playerDiv = document.createElement("div");
    playerDiv.className = "playerTable"

    displayMainPlayer(playerDiv);

    if(nPlayersPlaying > 1) {
      displayOtherPlayers(playerDiv);
    }

    var table = document.getElementById("playingTable");
    table.appendChild(playerDiv);
}

function setHTMLForPlayers(player, newDiv, className) {
  text = document.createTextNode(className.concat(player.toString()));
  tag.className = className.trim();
  tag.appendChild(text);
  newDiv.appendChild(tag);
}

function placeTwoPlayers(newDiv, className) {
  for (var i = 1; i <= nPlayersPlaying; i++) {
    tag = document.createElement("p");
    if(id == i) {
      continue;
    }
    tag.setAttribute("id", className.trim().concat("4"));

    setHTMLForPlayers(i, newDiv, className);
  }
}

function placeThreePlayers(newDiv, className) {
  for (var i = 1; i <= nPlayersPlaying; i++) {
    tag = document.createElement("p");
    if(id == 1) {
      if(i == 2) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
    }else if(id == 2) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
    }else if(id == 3) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
    }
    if(id != i) {
      setHTMLForPlayers(i, newDiv, className);
    }
  }
}

function placeFourPlayers(newDiv, className) {
  for(var i = 1; i <= nPlayersPlaying; i++) {
    tag = document.createElement("p");
    if(id == 1) {
      if(i == 2) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
    }else if(id == 2) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
    }else if(id == 3) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
    }else if(id == 4) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
    }
    if(id != i) {
      setHTMLForPlayers(i, newDiv, className);
    }
  }
}

function placeFivePlayers(newDiv, className) {
  for(var i = 1; i <= nPlayersPlaying; i++) {
    tag = document.createElement("p");
    if(id == 1) {
      if(i == 2) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
    }else if(id == 2) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
    }else if(id == 3) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
    }else if(id == 4) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
    }else if(id == 5) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
    }
    if(id != i) {
      setHTMLForPlayers(i, newDiv, className);
    }
  }
}

function placeSixPlayers(newDiv, className) {

  for (var i = 1; i <= nPlayersPlaying; i++) {
    tag = document.createElement("p");
    if(id == 1) {
      if(i == 2) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 6) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
    }else if(id == 2) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 6) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
    }else if(id == 3) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 6) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
    }else if(id == 4) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 6) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
    }else if(id == 5) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
      else if(i == 6) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
    }else if(id == 6) {
      if(i == 1) {
        tag.setAttribute("id", className.trim().concat("2"));
      }
      else if(i == 2) {
        tag.setAttribute("id", className.trim().concat("3"));
      }
      else if(i == 3) {
        tag.setAttribute("id", className.trim().concat("4"));
      }
      else if(i == 4) {
        tag.setAttribute("id", className.trim().concat("5"));
      }
      else if(i == 5) {
        tag.setAttribute("id", className.trim().concat("6"));
      }
    }
    if(id != i) {
      setHTMLForPlayers(i, newDiv, className);
    }
  }
}

function displayOtherPlayers(newDiv) {
  if(nPlayersPlaying == 2) {
    placeTwoPlayers(newDiv, className);
  } else if(nPlayersPlaying == 3) {
    placeThreePlayers(newDiv, className);
  } else if(nPlayersPlaying == 4) {
    placeFourPlayers(newDiv, className);
  } else if(nPlayersPlaying == 5) {
    placeFivePlayers(newDiv, className);
  } else if(nPlayersPlaying == 6) {
    placeSixPlayers(newDiv, className);
  }
}

function displayMainPlayer(newDiv) {
  var mainID = "Player1";
  var tag = document.createElement("p");
  var className = "Player ";
  tag.setAttribute("id", mainID);
  tag.className = className.trim();

  var text = document.createTextNode(className + id);

  tag.appendChild(text);
  newDiv.appendChild(tag);
}

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

function commslogServerHtml(jsonObj) {
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

function displayGame() {
  playingTable.hidden = false;
  playersPlaying.hidden = false;
}

function stopDisplayGame() {
  playingTable.hidden = true;
  playersPlaying.hidden = true;
}

function htmlEscape(str) {
  return str
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isPlayerID(str) {
  playerID.innerHTML = "PlayerID: " + str;
  id = str;
}

function setTotalPlayingPlayers(str) {
  nPlayersPlaying = str;
  playersPlaying.innerHTML =
    "Number Of Players In The Game: " + nPlayersPlaying;
}

function setTotalPlayers(str) {
  totalPlayers.innerHTML = "Total Number Of Players: " + str;
}

function constructJSONPayload(message = "Leaving") {
  return JSON.stringify({
    From: parseInt(playerID.innerHTML.substring(10, playerID.innerHTML.length)),
    To: parseInt(recipients.value) || 0,
    Message: message,
  });
}

function updateState() {
  function disable() {
    sendMessage.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
    recipients.disabled = true;
    startButton.disabled = true;
    stopDisplayGame();
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
        playerID.innerHTML = "PlayerID: N/a";
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
        stateLabel.innerHTML =
          "Unknown WebSocket State: " + htmlEscape(socket.readyState);
        disable();
        break;
    }
  }
}
