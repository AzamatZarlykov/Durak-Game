using System;
using System.Linq;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Collections.Generic;

using DurakGame.Server.Library.GamePlayer;

namespace DurakGame.Server.Middleware
{
    public class ConnectionManager
    {   
        // Keep track of users ID and their websockets connection
        private ConcurrentDictionary<int, WebSocket> _sockets = new ConcurrentDictionary<int, WebSocket>();

        public List<int> GetIDsOfPlayers() => new List<int>(_sockets.Keys);

        public int GetTotalPlayers() => _sockets.Count;

        public ConcurrentDictionary<int, WebSocket> GetAllSockets() => _sockets;

        public WebSocket RemoveElementFromSockets(int id)
        {
            _sockets.TryRemove(id, out WebSocket socket);
            return socket;
        }

        public List<Player> GetFirstPlayersPlaying(int totalPlayers)
        {
            List<Player> buffer = new List<Player>();

            int count = 0;
            foreach (var element in _sockets)
            {
                if (count == totalPlayers) break;

                count += 1;

                Player player = new Player();
                player.ID = element.Key;

                buffer.Add(player);
            }

            return buffer;
        }
        
        public int AddSocket(WebSocket socket)
        {
            int playerID;
            int lastID;
            if(GetTotalPlayers() == 0)
            {
                playerID = GetTotalPlayers() + 1;
            }
            else
            {
                lastID = _sockets.Keys.Last() + 1;
                playerID = lastID;
            }
            _sockets.TryAdd(playerID, socket);
            Console.WriteLine("Connection Added: " + playerID.ToString());
            return playerID;
        }
    }
}
