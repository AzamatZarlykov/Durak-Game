using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using DurakGame.Server.Helper;

namespace DurakGame.Server.Middleware
{
    public class Middleware
    {
        private string command;
        private readonly RequestDelegate _next;

        private readonly ConnectionManager _manager;
        public Middleware(RequestDelegate next, ConnectionManager manager)
        {
            _next = next;
            _manager = manager;
        }
         
        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                // Acceptping the websocket connection
                WebSocket websocket = await context.WebSockets.AcceptWebSocketAsync();

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

                        if(route.Message == "Leaving")
                        {
                            // Sending the client the number of players when they leave to update their page with current number of players 
                            await UpdatePlayersNumberAsync(websocket);
                        }
                        else if(route.Message == "StartGame")
                        {
                            Console.WriteLine("Player: " + route.From + " wants to joing the game");

                            // Move the player to gameRoom.html
                            await InformStartGame(route);

                        }else if(route.Message == "EndGame")
                        {
                            Console.WriteLine("ENDGAME CALLING");
                            await InformGameEnding();
                        }
                        else
                        {
                            // Route the messages from client to client
                            await RouteJSONMessageAsync(route);
                        }
                        return;
                    }
                    // Handling the client when they decide to leave/close the connection
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        // Get the ID of the player that wants to leave/disconnect
                        int id = _manager.GetAllSockets().FirstOrDefault(s => s.Value == websocket).Key;
                        // Remove the player from the collection of players 
                        WebSocket sock =  _manager.RemoveElementFromSockets(id);
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
                await _next(context);
            }
        }
        
        private async Task DistributeJSONToWebSockets<T>(T data)
        {
            foreach(var socket in _manager.GetAllSockets())
            {
                await SendJSONAsync(socket.Value, data);
            }
        }

        private async Task InformGameEnding()
        {
            command = "EndGame";
            await DistributeJSONToWebSockets(new { command });
        }

        private async Task InformStartGame(ClientMessage route)
        {
            command = "JoinGame";
            await DistributeJSONToWebSockets(new { command, route.From});
        }

        private async Task InformLeavingToOtherPlayersAsync(int leavingPlayerID)
        {
            command = "InformLeaving";
            int totalPlayers = _manager.GetTotalPlayers();
            await DistributeJSONToWebSockets(new { command, leavingPlayerID, totalPlayers });
        }

        private async Task UpdatePlayersNumberAsync(WebSocket websocket)
        {
            command = "Goodbye";
            int totalPlayers = _manager.GetTotalPlayers() - 1;
            await SendJSONAsync(websocket, new { command, totalPlayers });
        }

        private async Task InformJoiningToOtherPlayersAsync(int totalPlayers, int playerID)
        {
            command = "InformJoining";
            foreach (var socket in _manager.GetAllSockets())
            {
                if(socket.Key != playerID)
                {
                    await SendJSONAsync(socket.Value,new { command, playerID, totalPlayers });
                }
            }
        }

        private async Task InformPlayerInformationAsync(WebSocket websocket)
        {
            command = "SetPlayerID";
            int playerID = _manager.AddSocket(websocket);
            int totalPlayers = _manager.GetTotalPlayers();
            await SendJSONAsync(websocket, new { command, playerID, totalPlayers });
            await InformJoiningToOtherPlayersAsync(totalPlayers, playerID);
        }

        private async Task SendJSONAsync<T>(WebSocket socket, T data)
        {
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data));
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        /*
        Using the deserialized object parse the properties to get the destinations of the messages.
        */
        private async Task RouteJSONMessageAsync(ClientMessage route)
        {
            // Send message to the given destination. Otherwise, send to everyone
            // From and To parts of the object are IDs of the players
            if (route.To != 0)
            {
                // Prepare serializing the message as a json back to clients
                command = "UserMessagePrivate";
                var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { command, route.From, route.Message }));
                // Get the <key, value> pair from the dictionary of the destination client
                var socket = _manager.GetAllSockets().FirstOrDefault(s => s.Key == route.To);

                if(socket.Value != null)
                {
                    if (socket.Value.State == WebSocketState.Open)
                    {
                        await socket.Value.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
                else
                {
                    Console.WriteLine("Invalid Recepient");
                }
            }else
            {
                // Prepare serializing the message as a json back to clients
                command = "UserMessage";
                var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { command, route.From, route.Message }));

                foreach (var socket in _manager.GetAllSockets())
                {
                    if(socket.Value.State == WebSocketState.Open && socket.Key != route.From)
                    {
                        await socket.Value.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
            }
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



