using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace DurakGame.Server.Middleware
{
    public class DurakServerConnectionManager
    {
        private int numberOfPlayers = 0;
        private ConcurrentDictionary<StringBuilder, WebSocket> _sockets = new ConcurrentDictionary<StringBuilder, WebSocket>();

        public ConcurrentDictionary<StringBuilder, WebSocket> GetAllSockets()
        {
            return _sockets;
        }

        public StringBuilder AddSocket(WebSocket socket)
        {
            numberOfPlayers += 1;

            StringBuilder playerID = new StringBuilder("Player");
            playerID.Append(numberOfPlayers.ToString());
            
            _sockets.TryAdd(playerID, socket);
            Console.WriteLine("Connection Added: " + playerID);
            return playerID;
        }
    }
}
