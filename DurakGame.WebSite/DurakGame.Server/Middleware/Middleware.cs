using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Collections.Generic;

using DurakGame.Server.JSONHelper;
using DurakGame.Server.Library.Game;
using DurakGame.Server.Library.GamePlayer;

namespace DurakGame.Server.Middleware
{
    public class Middleware
    {
        private string command;

        private readonly RequestDelegate next;

        private readonly ConnectionManager manager;

        private Durak game = new Durak();

        public Middleware(RequestDelegate _next, ConnectionManager _manager)
        {
            next = _next;
            manager = _manager;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                // Accepting the websocket connection
                WebSocket websocket = await context.WebSockets.AcceptWebSocketAsync();

                //await InformPlayerInformationAsync(websocket);
                await InformPlayerInformationAsync(websocket);

                // Handling the actions of the client
                await ReceiveMessage(websocket, async (result, buffer) =>
                {
                    // Handling the text messages from the client
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        // Storing the message from the client into json string e.g {"command":"SetPlayerID";"playerID":1;"totalPlayers":3}
                        string jsonMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        // Deserialize from json string to an object 
                        var options = new JsonSerializerOptions { IncludeFields = true };
                        var route = JsonSerializer.Deserialize<ClientMessage>(jsonMessage, options);

                        switch (route.Message)
                        {
                            case "StartGame":
                                if (game.GameInProgress)
                                {
                                    Console.WriteLine("Game is being played");
                                }
                                else
                                {
                                    // Send the information about the game 
                                    // to all players that are playing the game:
                                    // IDs, total number of players, list of theirs
                                    // ids and who started the game
                                    await UpdateInformationAboutGame(route);
                                }
                                break;
                            case "RequestStateGame":
                                await InformGameState(websocket);
                                break;
                            default:
                                Console.WriteLine("Unknown Message from the client");
                                break;
                        }
                        return;
                    }
                    // Handling the client when they decide to leave/close the connection
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {

                        // Get the ID of the player that wants to leave/disconnect
                        if (manager.IsPlayingSocket(websocket))
                        {
                            int id = manager.GetPlayingSockets().IndexOf(websocket);
                            // Send messages to players informing which player leaves and update the number of players
                            // only if the game is on
                            if (game.GameInProgress)
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
                        await websocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);

                        return;
                    }
                });
            }
            else
            {
                await next(context);
            }
        }

        private async Task DistributeJSONToWebSockets<T>(T data)
        {
            foreach (var socket in manager.GetAllSockets())
            {
                await SendJSON(socket, data);
            }
        }

        private async Task UpdateInformationAboutGame(ClientMessage route)
        {
            command = "JoinGame";

            int totalPlayers = manager.GetTotalPlayers();

            if (totalPlayers > 6) totalPlayers = 6;

            List<WebSocket> playersPlaying = manager.GetFirstPlayersPlaying(totalPlayers);

            List<Player> players = new List<Player>();

            for (int i = 0; i < playersPlaying.Count; i++)
            {
                Player p = new Player();
                players.Add(p);

                int playerID = i;

                await SendJSON(playersPlaying[i], new { command, playerID, totalPlayers });
            }

            // Assigning players to the instance of the game class
            // where players ID are assigned 
            game.players = players;
        }

        private async Task InformLeavingToOtherPlayers(int leavingPlayerID)
        {
            command = "InformLeaving";

            int totalPlayers = manager.GetTotalPlayers();

            await DistributeJSONToWebSockets(new { command, leavingPlayerID, totalPlayers });
        }

        private async Task InformGameState(WebSocket socket)
        {
            command = "RequestStateGame";

            bool gameState = game.GameInProgress;

            await SendJSON(socket, new { command, gameState });
        }

        // When someone connects, send to everyone how many people are in the server/game
        private async Task InformPlayerInformationAsync(WebSocket websocket)
        {
            command = "SetTotalPlayers";

            manager.AddSocket(websocket);

            int totalPlayers = manager.GetTotalPlayers();

            foreach (var socket in manager.GetAllSockets())
            {
                await SendJSON(socket, new { command, totalPlayers });
            }
        }

        private async Task SendJSON<T>(WebSocket socket, T data)
        {
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data));
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task ReceiveMessage(WebSocket socket, Action<WebSocketReceiveResult, byte[]> handleMessage)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer: new ArraySegment<byte>(buffer),
                    cancellationToken: CancellationToken.None);

                handleMessage(result, buffer);
            }
        }
    }
}



