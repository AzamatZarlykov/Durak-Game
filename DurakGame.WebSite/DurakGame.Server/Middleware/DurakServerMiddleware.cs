using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace DurakGame.Server.Middleware
{
    public class DurakServerMiddleware
    {
        private readonly RequestDelegate _next;

        public DurakServerMiddleware(RequestDelegate next)
        {
            _next = next;
        }
         
        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                WebSocket websocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket Connected");

                await ReceiveMessage(websocket, async (result, buffer) =>
                {
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        Console.WriteLine("Message Received");
                        Console.WriteLine($"Message : {Encoding.UTF8.GetString(buffer, 0, result.Count)}");
                        return;
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("Received Close Message");
                        return;
                    }
                });
            }
            else
            {
                await _next(context);
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
