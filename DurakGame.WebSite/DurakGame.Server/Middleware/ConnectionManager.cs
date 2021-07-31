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
        private Dictionary<int, WebSocket> sockets = new Dictionary<int, WebSocket>();

        public List<int> GetIDsOfPlayers() => new List<int>(sockets.Keys);

        public int GetTotalPlayers() => sockets.Count;

        public Dictionary<int, WebSocket> GetAllSockets() => sockets;

        public WebSocket RemoveElementFromSockets(int id)
        {
            WebSocket socket = sockets[id];
            sockets.Remove(id);
            return socket;
        }

        public List<(int, WebSocket)> GetFirstPlayersPlaying(int totalPlayersPlaying)
        {
            List<(int, WebSocket)> players = new List<(int, WebSocket)>();

            int count = 0;
            foreach (var element in sockets)
            {
                if (count == totalPlayersPlaying) break;

                count += 1;

                players.Add((element.Key, element.Value));
            }

            return players;
        }

        public int AddSocket(WebSocket socket)
        {
            int playerID = FindAvailableID(sockets);

            sockets.TryAdd(playerID, socket);

            return playerID;
        }

        // Method that finds from the dictionary the next
        // available ID for the connecting player to assign
        public int FindAvailableID(Dictionary<int, WebSocket> dictionary)
        {
            for (int i = 1; true; ++i)
            {
                if (!dictionary.ContainsKey(i))
                {
                    return i;
                }
            }
        }
    }
}
