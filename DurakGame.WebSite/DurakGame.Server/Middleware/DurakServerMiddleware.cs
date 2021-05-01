using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace DurakGame.Server.Middleware
{
    public class DurakServerMiddleware
    {
        private string command;
        private readonly RequestDelegate _next;

        private readonly DurakServerConnectionManager _manager;
        public DurakServerMiddleware(RequestDelegate next, DurakServerConnectionManager manager)
        {
            _next = next;
            _manager = manager;
        }
         
        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                WebSocket websocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket Connected");

                await InformPlayerInformationAsync(websocket);

                await ReceiveMessage(websocket, async (result, buffer) =>
                {
                    Console.WriteLine(result);
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        Console.WriteLine($"Message : {Encoding.UTF8.GetString(buffer, 0, result.Count)}");
                        await RouteJSONMessageAsync(Encoding.UTF8.GetString(buffer, 0, result.Count));
                        return;
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        int id = _manager.GetAllSockets().FirstOrDefault(s => s.Value == websocket).Key;
                        Console.WriteLine("Receive ----> Close From " + id.ToString());

                        WebSocket sock =  _manager.RemoveElementFromSockets(id);

                        await InformLeavingToOtherPlayersAsync(id);

                        Console.WriteLine("Managed Connections: " + _manager.GetAllSockets().Count.ToString());

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

        private async Task InformLeavingToOtherPlayersAsync(int leavingPlayerID)
        {
            command = "InformLeaving";
            int totalPlayers = _manager.GetTotalPlayers();
            foreach (var socket in _manager.GetAllSockets())
            {
                await SendJSONAsync(socket.Value, JsonSerializer.Serialize(new { command, leavingPlayerID, totalPlayers }));
            }
        }

        private async Task InformJoiningToOtherPlayersAsync(int totalPlayers, int playerID)
        {
            command = "InformJoining";
            foreach (var socket in _manager.GetAllSockets())
            {
                if(socket.Key != playerID)
                {
                    await SendJSONAsync(socket.Value, JsonSerializer.Serialize(new { command, playerID, totalPlayers }));
                }
            }
        }

        private async Task InformPlayerInformationAsync(WebSocket websocket)
        {
            command = "SetPlayerID";
            int playerID = _manager.AddSocket(websocket);
            int totalPlayers = _manager.GetTotalPlayers();
            await SendJSONAsync(websocket, JsonSerializer.Serialize(new { command, playerID, totalPlayers }));
            await InformJoiningToOtherPlayersAsync(totalPlayers, playerID);
        }

        private async Task SendJSONAsync(WebSocket socket, string jsonFile)
        {
            var buffer = Encoding.UTF8.GetBytes(jsonFile);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        /*
        Deserialize the string using the JsonConvert class to get the object. Using the object
        use it to pass the message to the destination. Or to everyone. 
        */
        private async Task RouteJSONMessageAsync(string jsonMessage)
        {
            command = "UserMessage";
            var route = JsonSerializer.Deserialize<dynamic>(jsonMessage);

            string message = route.Message;
            string from = route.From;

            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { command, message, from}));
            // Send message to the given destination. Otherwise, send to everyone
            // From and To parts of the object are IDs of the players

            if (int.TryParse(route.To.ToString(), out int val))
            {
                Console.WriteLine("Specified to " + route.To);
                // get the KeyValue pair of the recepient 
                var socket = _manager.GetAllSockets().FirstOrDefault(s => s.Key == route.To.ToString());
                if(socket.Value != null)
                {
                    if (socket.Value.State == WebSocketState.Open)
                    {
                        Console.WriteLine("Connection Open on " + socket.Key);
                        await socket.Value.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
                else
                {
                    Console.WriteLine("Invalid Recepient");
                }
            }else
            {
                Console.WriteLine("BroadCast to Everyone");
                // Send to everyone the message
                foreach(var socket in _manager.GetAllSockets())
                {
                    if(socket.Value.State == WebSocketState.Open)
                    {
                        Console.WriteLine("Connection Open on " + socket.Key);
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



