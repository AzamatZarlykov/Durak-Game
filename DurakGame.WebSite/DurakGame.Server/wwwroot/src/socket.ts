import { View } from 'view';

let playingTable = document.getElementById("playingTable") as HTMLDivElement;
let startButton = document.getElementById("startGameButton") as HTMLButtonElement;

let socket: WebSocket;
let connectionUrl: string;

let tag: HTMLParagraphElement;
let text;
let className: string = "Player ";

let scheme: string = document.location.protocol === "https:" ? "wss" : "ws";
let port: string = document.location.port ? (":" + document.location.port) : "";

let id: number; // id of the player 
let nPlayers: number; // total number of players on the webpage
let nPlayersPlaying: number; // total number of players playing on the table

let idsOfPlayers: number[]; // a list of player IDs

let informLeavingCommand: string = "InformLeaving";
let joinGameCommand: string = "JoinGame";
let requestStateGameCommand: string = "RequestStateGame";
let setTotalPlayersCommand: string = "SetTotalPlayers";

let allCommands: string[] = [
    informLeavingCommand,
    joinGameCommand,
    requestStateGameCommand,
    setTotalPlayersCommand,
];

connectionUrl = scheme + "://" + document.location.hostname + port + "/ws";

socket = new WebSocket(connectionUrl);

socket.onopen = function (event) : void{
    updateState();
};
socket.onclose = function (event) : void{
    updateState();
};
socket.onerror = updateState;

socket.onmessage = function (event) : void {
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
                    // remove the player left from the existing playing players
                    // so that players can be redistributed around the table.
                    removeFromPlayingPlayers(obj.leavingPlayerID);

                    setPlayingPlayers(obj.sizeOfPlayers);

                    if (nPlayersPlaying > 1) {
                        setPlayingPlayers(nPlayersPlaying);
                        displayPlayersPositionsAroundTable(true);
                    } else {
                        // when 1 person left the game is over. Close the board and tell server that game
                        // has finished
                        stopDisplayTable();

                        // no players playing
                        setPlayingPlayers(0);

                        console.log("The game is over");
                    }
                    console.log("Player " + obj.leavingPlayerID + " left the game");
                } else {
                    console.log("Player" + obj.leavingPlayerID + " left the server");
                }
                break;
            // When any player starts the game, the server sends this message to all the players in the 
            // game to join the playing room. This statement displays number of playing players and displays
            // each players position on the table
            case (joinGameCommand):
                let view = new View("Azamat");
                console.log(view.greet());
                console.log("Game started");

                console.log(obj);

                setPlayerID(obj.playerID);
                setOtherPlayerIDs(); // if nPlayers = 5; then idsOfPlayers = [0,1,2,3,4]
                setPlayingPlayers(obj.sizeOfPlayers);

                displayTable();
                displayPlayersPositionsAroundTable(false);
                break;
            // Handles the message about the state of the game from the server
            case (requestStateGameCommand):
                if (obj.command == requestStateGameCommand) {
                    if (!obj.gameState) {
                        let data: string = constructJSONPayload("StartGame");
                        socket.send(data);
                    } else {
                        console.log("Game is already being played");
                    }
                }
                break;
        }
    } else {
        console.log("Unknown command from the server");
    }
};

startButton.onclick = function (): void {
    if (nPlayers > 1) {
        let data: string = constructJSONPayload(requestStateGameCommand);
        socket.send(data);
    } else {
        console.log("Not enough people on the server to play");
    }
}

/*
Displays the table and the current number of 
players joined to the game
*/
function displayTable() : void {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ctx = canvas.getContext('2d');

    // Draws the empty table
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 10;

    ctx.fillRect(170, 40, 1000, 550);
    ctx.strokeRect(170, 40, 1000, 550);
    ctx.save();
}

/*
Stops displaying the table and the current number of 
players joined to the game
*/
function stopDisplayTable() {
    var canvas = document.getElementById("canvas");
    canvas.style.display = "none";
}

function updateState() : void {
    function disable() {
        startButton.disabled = true;
        stopDisplayTable();
    }
    function enable() {
        startButton.disabled = false;
    }

    if (!socket) {
        disable();
    } else {
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
function setPlayingPlayers(count : number) : void {
    nPlayersPlaying = count;
    console.log("Number Of Players In The Game: " + nPlayersPlaying);
}

/*
places players in the right positions based on the folowing information:
number of players: nPlayersPlaying, list of existing players: existingPlayers, 
list of positions avaliable: it is passed as an argument. 
*/
function placePlayers(newDiv:HTMLDivElement, pos:number[]) : void {
    let names : number[] = shuffle();
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
function setHTMLForPlayers(newDiv: HTMLDivElement, player: number) : void{
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
function removeDOM(htmlID: string): void {
    let obj = document.getElementById(htmlID);
    obj.remove();
}

/*
displays the players around the table. The bool redraw is responsible
if function should delete previous div element of players and add new
div with updated number of elements
*/
function displayPlayersPositionsAroundTable(redraw : boolean) : void {


    // Display the main player 
    displayMainPlayer();

    // Display other players 
    //displayOtherPlayers(playerDiv);
}

// Determines the placing based on number of players
function displayOtherPlayers(newDiv : HTMLDivElement) : void {
    if (nPlayersPlaying == 2) {
        placePlayers(newDiv, [4]);
    } else if (nPlayersPlaying == 3) {
        placePlayers(newDiv, [3, 5]);
    } else if (nPlayersPlaying == 4) {
        placePlayers(newDiv, [3, 4, 5]);
    } else if (nPlayersPlaying == 5) {
        placePlayers(newDiv, [2, 3, 5, 6]);
    } else if (nPlayersPlaying == 6) {
        placePlayers(newDiv, [2, 3, 4, 5, 6]);
    }
}

// Displays the main player
function displayMainPlayer(): void {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;

    let ctx = canvas.getContext('2d');
    ctx.font = '12px serif';
    ctx.fillText(className + id, 170 + 500 - 20, 40 + 550 - 20);
}

/*
Returns the JSON object that containts the message to the server
*/
function constructJSONPayload(message) : string{
    return JSON.stringify({
        From: id,
        Message: message,
    });
}

/*
Sets the total number of players on html
*/
function setTotalPlayers(count: number) : void {
    nPlayers = count;
}

/*
Sets the player ID on html
*/
function setPlayerID(identifier: number) : void {
    id = identifier;
    console.log("ID of the player is: " + id.toString());
}

/*
Sets the list of ids of other players 
*/
function setOtherPlayerIDs(): void {
    
    idsOfPlayers = Array.from(Array(nPlayers).keys())
}

/*
Remove the player from the existing playing players
based on the playerID
*/
function removeFromPlayingPlayers(idToDelete: number): void {
    var index = idsOfPlayers.indexOf(idToDelete);
    // if the player left was playing splice the list
    // else do nothing
    if (index !== -1) {
        idsOfPlayers.splice(index, 1);
    }
}

function htmlEscape(str: string) : string {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}