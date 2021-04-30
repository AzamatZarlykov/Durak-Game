using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace DurakGame.Server.Middleware
{
    public class DurakServerMiddleware
    {
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

                // Send the players ID back to client to show on their window
                string playerID = _manager.AddSocket(websocket);
                await SendPlayerIDAsync(websocket, playerID);

                // Send the total number of players to client to represent players connected
                int totalPlayers = _manager.GetTotalPlayers();
                await SendTotalNumberOfPlayersAsync(websocket, totalPlayers);

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
                        string id = _manager.GetAllSockets().FirstOrDefault(s => s.Value == websocket).Key;
                        Console.WriteLine("Receive ----> Close From " + id);

                        WebSocket sock =  _manager.RemoveElementFromSockets(id);

                        Console.WriteLine("Managed Connections: " + _manager.GetAllSockets().Count.ToString());

                        // Send the number of players left after the player closes the connection
                        // int leftPlayers = _manager.GetTotalPlayers();
                        // await SendTotalNumberOfPlayersAsync(sock, leftPlayers);

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
        /*
        Deserialize the string using the JsonConvert class to get the object. Using the object
        use it to pass the message to the destination. Or to everyone. 
        */
        private async Task RouteJSONMessageAsync(string message)
        {
            // Deserialize the message of the format -> {"From":"1","To":"","Message":"asdf"}
            // into route object
            var route = JsonConvert.DeserializeObject<dynamic>(message);

            // Send message to the given destination. Otherwise, send to everyone
            // From and To parts of the object are IDs of the players
            Console.WriteLine(int.TryParse(route.To.ToString(), out int v));
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
                        await socket.Value.SendAsync(Encoding.UTF8.GetBytes(route.Message.ToString()),
                            WebSocketMessageType.Text, true, CancellationToken.None);
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
                        await socket.Value.SendAsync(Encoding.UTF8.GetBytes(route.Message.ToString()), 
                            WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
            }
        }

        private async Task SendPlayerIDAsync(WebSocket socket, string playerID)
        {
            var buffer = Encoding.UTF8.GetBytes("PlayerID: " + playerID);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task SendTotalNumberOfPlayersAsync(WebSocket socket, int totalPlayers)
        {
            var buffer = Encoding.UTF8.GetBytes(totalPlayers.ToString());
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
