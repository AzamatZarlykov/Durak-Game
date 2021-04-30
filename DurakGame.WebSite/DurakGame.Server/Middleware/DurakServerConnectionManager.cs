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
        private ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

        public ConcurrentDictionary<string, WebSocket> GetAllSockets()
        {
            return _sockets;
        }
        /*
        public int ReturnNumberOfPlayers()
        {
            Console.WriteLine("Total Number of Players: " + numberOfPlayers);
            return numberOfPlayers;
        }
        
        public WebSocket RemoveElementFromSockets(string id)
        {
            numberOfPlayers -= 1;
            _sockets.TryRemove(id, out WebSocket socket);
            return socket;
        }
        */
        public string AddSocket(WebSocket socket)
        {
            //string playerID = numberOfPlayers.ToString();
            string playerID = Guid.NewGuid().ToString();

            _sockets.TryAdd(playerID, socket);
            Console.WriteLine("Connection Added: " + playerID);
            return playerID;
        }
    }
}
