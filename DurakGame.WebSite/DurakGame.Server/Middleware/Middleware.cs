using System;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Collections.Generic;

using DurakGame.Library.Game;

namespace DurakGame.Server.Middleware
{
    public enum WaitingRoomState { NotReady, Ready }

    public class ClientMessage
    {
        public int From;
        public string Message;
        public int Card;
        public int[] GameSetting;
        public int Icon;
        public string Name;
    }

    public class Middleware
    {
        private string command;

        private readonly RequestDelegate next;

        private readonly ConnectionManager manager;

        private bool[] availableIcons = new bool[6] { true, true, true, true, true, true };

        private Durak game = new Durak();

        public Middleware(RequestDelegate _next, ConnectionManager _manager)
        {
            next = _next;
            manager = _manager;
        }

        private async Task SendJSON<T>(WebSocket socket, T data)
        {
            var options = new JsonSerializerOptions { IncludeFields = true };
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data, options));
            Console.WriteLine("SERVER: " + JsonSerializer.Serialize(data, options));
            Console.WriteLine();
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task DistributeJSONToWebSockets<T>(T data, WebSocket websocket = null)
        {
            foreach (var socket in manager.GetAllSockets())
            {
                if (websocket == socket)
                {
                    continue;
                }
                await SendJSON(socket, data);
            }
        }

        private async Task DistributeGameViewToPlayers()
        {
            for (int i = 0; i < game.GetPlayers().Count; i++)
            {
                GameView gameView = new GameView(game, i);
                await SendJSON(manager.GetAllSockets()[i], new
                {
                    command,
                    gameView
                });
            }
        }

        private async Task ManageAttackOutcomeWarnings(MoveResult outcome, WebSocket socket)
        {
                if (outcome == MoveResult.OutOfTurn)
                {
                    command = "Wait";
                }
                else if (outcome == MoveResult.IllegalMove)
                {
                    command = "Illegal";
                }
                else if (outcome == MoveResult.ExtraCard)
                {
                    command = "ExtraCard";
                }
                else if (outcome == MoveResult.GameIsOver)
                {
                    command = "GameIsAlreadyOver";
                }
                else if (outcome == MoveResult.PassportViolation)
                {
                    command = "PassportViolation";
                }
                else if (outcome == MoveResult.UseDisplayButton)
                {
                    command = "UseDisplayButton";
                }
                await SendJSON(socket, new
                {
                    command
                });
        }

        private async Task ManageDefenseOutcomeWarning(MoveResult outcome, WebSocket socket)
        {
            if (outcome == MoveResult.OutOfTurn)
            {
                command = "Wait";
            }
            else if (outcome == MoveResult.IllegalMove)
            {
                command = "Illegal";
            }
            else if (outcome == MoveResult.TookCards)
            {
                command = "TookCards";
            }
            else if (outcome == MoveResult.PassportViolation)
            {
                command = "PassportViolation";
            }

            await SendJSON(socket, new
            {
                command
            });
        }

        private async Task UpdateGameProcess(ClientMessage route, WebSocket socket)
        {
            command = "UpdateGameProcess";
            MoveResult outcome;

            switch (route.Message)
            {
                case "Attacking":
                    outcome = game.AttackerMove(route.Card);

                    if (outcome != MoveResult.OK)
                    {
                        await ManageAttackOutcomeWarnings(outcome, socket);
                        return;
                    }

                    break;
                case "Defending":
                    outcome = game.DefenderMove(route.Card);

                    if (outcome != MoveResult.OK)
                    {
                        await ManageDefenseOutcomeWarning(outcome, socket);
                        return;
                    }

                    break;
                case "Done":
                    game.AttackerDone();
                    break;
                case "Take":
                    command = "TakeCards";
                    game.DefenderTake();
                    break;
            }

            // Distribute updated GameView to players
            await DistributeGameViewToPlayers();
        }

        private async Task InformLeavingToOtherPlayers(int leavingPlayerID)
        {
            command = "InformLeaving";

            int totalPlayers = manager.GetTotalPlayers();
            int sizeOfPlayers = game.GetSizeOfPlayers();

            await DistributeJSONToWebSockets(new { 
                command, leavingPlayerID, sizeOfPlayers, totalPlayers 
            });
        }

        private async Task ReceiveMessage(WebSocket socket, 
            Action<WebSocketReceiveResult, byte[]> handleMessage)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer: new ArraySegment<byte>(buffer),
                    cancellationToken: CancellationToken.None);

                handleMessage(result, buffer);
            }
        }

        private void SetupDurakGame(int[] gameSetting)
        {
            game.SetupGameVariation(gameSetting[0]);
            game.SetupGameType(gameSetting[2]);
        }

        private bool DecideIfPlaying(GameStatus gs, int index, WebSocket socket)
        {
            return gs == GameStatus.NotCreated && index < 7 || manager.IsSocketInTheGame(socket);
        }

        // When someone connects, send to everyone how many people are in the server/game
        private async Task InformPlayerInformationAsync(WebSocket websocket)
        {
            command = "SetTotalPlayers";

            manager.AddSocket(websocket);

            int totalPlayers = manager.GetTotalPlayers();
            GameStatus gameStatus = game.gameStatus;
            bool isPlaying;

            foreach (var socket in manager.GetAllSockets())
            {
                isPlaying = DecideIfPlaying(gameStatus, manager.GetIndexOfSocket(socket), socket);

                await SendJSON(socket, new
                {
                    command,
                    totalPlayers,
                    gameStatus,
                    isPlaying
                });
            }
        }

        private async Task InitializationOfTheGame(WebSocket websocket)
        {
            command = "JoinGame";

            int sizeOfPlayers = manager.GetTotalPlayers() > 6 ? 6 : manager.GetTotalPlayers();

            game.InstantiateGameSession(sizeOfPlayers);
            List<WebSocket> playersPlaying = manager.GetFirstPlayersPlaying(sizeOfPlayers);

            bool isCreator;
            bool isPlaying = true;

            GameStatus gameStatus = game.gameStatus;

            for (int playerID = 0; playerID < playersPlaying.Count; playerID++)
            {
                if (websocket == playersPlaying[playerID])
                {
                    isCreator = true;
                }
                else
                {
                    isCreator = false;
                }

                await SendJSON(playersPlaying[playerID], new
                {
                    command,
                    gameStatus,
                    playerID,
                    sizeOfPlayers,
                    isPlaying,
                    isCreator
                });
            }
        }

        private async Task UpdateAvailableIcons(WebSocket websocket)
        {
            command = "UpdateAvailableIcons";
            await SendJSON(websocket, new { command, availableIcons }); 
        }

        private async Task CheckPlayerSetup(ClientMessage route, WebSocket websocket)
        {
            command = "UpdatePlayerSetup";
            bool playerSetupOK = true;

            if (!game.IsUserNameAvailable(route.Name))
            {
                playerSetupOK = false;
            } 
            else
            {
                game.AssignUserName(route.Name, route.From);
                game.AssignIcon(route.Icon, route.From);
                // the icon on pos route.Icon is not available
                availableIcons[route.Icon] = false;
                game.GetPlayer(route.From).waitingRoomState = WaitingRoomState.Ready;
            }
            // send setup result to the user's websocket
            await SendJSON(websocket, new { command, playerSetupOK });
            // update other players' availableIcons list
            command = "UpdateAvailableIcons";
            int readyPlayers = game.GetNumberOfReadyPlayers();
            await DistributeJSONToWebSockets(new { command, availableIcons, readyPlayers });
        }

        private async Task InformStartGame()
        {
            command = "StartGame";

            game.StartGame();
            List<WebSocket> playersPlaying = manager.GetPlayingSockets();
            GameView gameView;

            string[] playerUserNames = game.GetUserNames();
            int[] takenIcons = game.GetIcons();

            for (int playerID = 0; playerID < playersPlaying.Count; playerID++)
            {
                gameView = new GameView(game, playerID);
                await SendJSON(playersPlaying[playerID], new
                {
                    command,
                    gameView,
                    playerUserNames,
                    takenIcons
                });
            }
        }

        private async Task HandleResetGameCommand()
        {
            // resets the game
            availableIcons = new bool[6] { true, true, true, true, true, true };
            game.Reset();

            command = "ResetSuccess";
            // send the success message to playing players 
            foreach(WebSocket socket in manager.GetPlayingSockets())
            {
                await SendJSON(socket, new 
                { 
                    command
                    // no need to send the reset gameView. it is done in client-side
                });
            }

            // reconnect the sockets of players who finished the game to maintain the 
            // order with sockets that already were waiting in the lobby
            manager.ReconnectTheConnectionOfOldPlayers();
        }

        private async Task HandleDisplayingPassports()
        {
            command = "UpdateGameProcess";
            game.DisplayPassports();
            // Distribute updated GameView to players
            await DistributeGameViewToPlayers();
        }

        private async Task NextRound()
        {
            game.ResetPassportRound();
            await DistributeGameViewToPlayers();
        }

        private async Task MessageHandle(ClientMessage route, WebSocket websocket)
        {

            switch (route.Message)
            {
                case "Attacking":
                    await UpdateGameProcess(route, websocket);
                    break;
                case "Defending":
                    await UpdateGameProcess(route, websocket);
                    break;
                case "Done":
                    await UpdateGameProcess(route, websocket);
                    break;
                case "Take":
                    await UpdateGameProcess(route, websocket);
                    break;
                case "CreateGame":
                    // Acknowledge that someone is creating the game and let other players 
                    // know that game is being created
                    await InitializationOfTheGame(websocket);
                    break;
                case "GameSetup":
                    SetupDurakGame(route.GameSetting);
                    await UpdateAvailableIcons(websocket);
                    break;
                case "PlayerSetup":
                    await CheckPlayerSetup(route, websocket);
                    break;
                case "StartGame":
                    await InformStartGame();
                    break;
                case "ResetGame":
                    await HandleResetGameCommand();
                    break;
                case "Show Passport":
                    await HandleDisplayingPassports();
                    break;
                case "NextRound":
                    await NextRound();
                    break;
                default:
                    Console.WriteLine("Unknown Message from the client");
                    break;
            }
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                // Accepting the websocket connection
                WebSocket websocket = await context.WebSockets.AcceptWebSocketAsync();

                //Informing about the connection of the socket
                await InformPlayerInformationAsync(websocket);

                // Handling the actions of the client
                await ReceiveMessage(websocket, async (result, buffer) =>
                {
                    // Handling the text messages from the client
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        // Storing the message from the client into json string e.g {"command":"SetPlayerID";"playerID":1;"totalPlayers":3}
                        string jsonMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        Console.WriteLine("Client: "+ jsonMessage);
                        // Deserialize from json string to an object 
                        var options = new JsonSerializerOptions { IncludeFields = true };
                        var route = JsonSerializer.Deserialize<ClientMessage>(jsonMessage, options);



                        await MessageHandle(route, websocket);

                        return;
                    }
                    // Handling the client when they decide to leave/close the connection
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {

                        // Get the ID of the player that wants to leave/disconnect
                        if (manager.IsPlayingSocket(websocket))
                        {
                            int id = manager.GetPlayingSockets().IndexOf(websocket);
                            // Send messages to players informing which player leaves and update
                            // the number of players
                            // only if the game is on
                            if (game.gameStatus == GameStatus.GameInProcess)
                            {
                                // Remove the players from the game 
                                game.RemovePlayer(id);

                                // During the game inform other players who left
                                await InformLeavingToOtherPlayers(id);
                            }
                        }
                        // Remove the player from the collection of players 
                        manager.RemoveElementFromSockets(websocket);

                        // Close the connection with the player
                        await websocket.CloseAsync(result.CloseStatus.Value, 
                            result.CloseStatusDescription, CancellationToken.None);

                        return;
                    }
                });
            }
            else
            {
                await next(context);
            }
        }
    }
}



