using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace DurakGame.Server.Middleware
{
    public class DurakServerConnectionManager
    {
        private int totalPlayers = 0;
        private ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

        public int GetTotalPlayers()
        {
            return totalPlayers;
        }
        public ConcurrentDictionary<string, WebSocket> GetAllSockets()
        {
            return _sockets;
        }
        
        public WebSocket RemoveElementFromSockets(string id)
        {
            totalPlayers -= 1;
            _sockets.TryRemove(id, out WebSocket socket);
            return socket;
        }
        
        public string AddSocket(WebSocket socket)
        {
            totalPlayers++;
            string playerID = totalPlayers.ToString();

            _sockets.TryAdd(playerID, socket);
            Console.WriteLine("Connection Added: " + playerID);
            return playerID;
        }
    }
}
