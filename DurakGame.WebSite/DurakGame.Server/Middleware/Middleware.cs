using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Collections.Generic;

using DurakGame.Server.Helper;
using DurakGame.Server.Library.Game;
using DurakGame.Server.Library.GamePlayer;

namespace DurakGame.Server.Middleware
{
    public class Middleware
    {
        private string command;

        private readonly RequestDelegate next;

        private readonly ConnectionManager manager;

        private Durak game;

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

                Console.WriteLine("Someone has connected");
                // Sending the player its information (id, totalPlayers) 
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

                        if (route.Message == "Leaving")
                        {
                            // Sending the client the number of players when they leave to update their page with current number of players 
                            await UpdatePlayersNumberAsync(websocket);
                        }
                        else if (route.Message == "StartGame")
                        {
                            if(game.GameInProgress)
                            {
                                Console.WriteLine("Game is being played");
                            } else
                            {
                                Console.WriteLine("Player: " + route.From + " started the game");

                                // This is where the game is being initialized
                                game = new Durak();

                                int totalPlayersPlaying = manager.GetTotalPlayers();

                                if (totalPlayersPlaying > 6) totalPlayersPlaying = 6;

                                List<Player> playersPlaying = manager.GetFirstPlayersPlaying(totalPlayersPlaying);

                                game.PlayingPlayers = playersPlaying;

                                // Move the player to gameRoom.html
                                await InformStartGame(route, totalPlayersPlaying);
                            }
                        }
                        else if (route.Message == "GameOver")
                        {
                            Console.WriteLine("ENDGAME CALLING");

                            // Set teh game in progress to be false
                            game.GameInProgress = false;

                            await InformGameEnding();
                        }
                        else if (route.Message == "RequestStateGame")
                        {
                            await InformGameState(websocket);
                        }
                        return;
                    }
                    // Handling the client when they decide to leave/close the connection
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        
                        // Get the ID of the player that wants to leave/disconnect
                        int id = manager.GetAllSockets().FirstOrDefault(s => s.Value == websocket).Key;
                        Console.WriteLine("The player " + id + " is leaving");
                        // Remove the player from the collection of players 
                        WebSocket sock =  manager.RemoveElementFromSockets(id);
                        // Send messages to players informing which player leaves and update the number of players
                        await InformLeavingToOtherPlayersAsync(id);
                        // Close the connection with the player
                        await sock.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);

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
                await SendJSONAsync(socket.Value, data);
            }
        }

        private async Task InformGameEnding()
        {
            command = "GameOver";
            await DistributeJSONToWebSockets(new { command });
        }

        private async Task InformStartGame(ClientMessage route, int totalPlayersPlaying)
        {
            command = "JoinGame";

            int from = route.From;

            int count = 0;

            foreach (var element in manager.GetAllSockets())
            {
                if (count == 6) break;

                count += 1;
                await SendJSONAsync(element.Value, new { command, totalPlayersPlaying, from });
            }
        }

        private async Task InformLeavingToOtherPlayersAsync(int leavingPlayerID)
        {
            command = "InformLeaving";
            int totalPlayers = manager.GetTotalPlayers();
            List<int> allPlayersIDs = manager.GetIDsOfPlayers();

            await DistributeJSONToWebSockets(new { command, leavingPlayerID, totalPlayers, allPlayersIDs });
        }

        private async Task UpdatePlayersNumberAsync(WebSocket websocket)
        {
            command = "Goodbye";
            int totalPlayers = manager.GetTotalPlayers() - 1;
            await SendJSONAsync(websocket, new { command, totalPlayers });
        }

        private async Task InformJoiningToOtherPlayersAsync(int totalPlayers, int playerID, List<int> allPlayersIDs)
        {
            command = "InformJoining";
            foreach (var socket in manager.GetAllSockets())
            {
                if (socket.Key != playerID)
                {
                    await SendJSONAsync(socket.Value,new { command, playerID, totalPlayers, allPlayersIDs });
                }
            }
        }

        private async Task InformPlayerInformationAsync(WebSocket websocket)
        {
            command = "SetPlayerID";
            int playerID = manager.AddSocket(websocket);
            int totalPlayers = manager.GetTotalPlayers();
            List<int> allPlayersIDs = manager.GetIDsOfPlayers();
            
            await SendJSONAsync(websocket, new { command, playerID, totalPlayers, allPlayersIDs });     
            await InformJoiningToOtherPlayersAsync(totalPlayers, playerID, allPlayersIDs);
        }

        private async Task InformGameState(WebSocket socket)
        {
            command = "RequestStateGame";
            int totalPlayers = manager.GetTotalPlayers();
            bool gameState = game.GameInProgress;

            await SendJSONAsync(socket, new { command, totalPlayers, gameState });
        }

        private async Task SendJSONAsync<T>(WebSocket socket, T data)
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



