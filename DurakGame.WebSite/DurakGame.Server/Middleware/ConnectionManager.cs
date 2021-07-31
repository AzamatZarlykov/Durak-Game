using System;
using System.Linq;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Collections.Generic;

using DurakGame.Server.Library.GamePlayer;

namespace DurakGame.Server.Middleware
{
    // Extension class
    public static class IDFinder
    {
        // Extension method that finds from the dictionary the next
        // available ID for the connecting player to assign
        public static int FindAvailableID(Dictionary<int, WebSocket> dictionary)
        {
            List<int> idList = new List<int>();

            foreach (var key in dictionary.Keys)
            {
                idList.Add(key);
            }


            idList.Sort();

            for (int i = 1; i < idList.Count; i++)
            {
                if (idList[i] - idList[i - 1] > 1)
                {
                    return idList[i - 1] + 1;
                }
            }
            return idList.Count + 1;
        }
    }

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

        public Dictionary<int, WebSocket> GetFirstPlayersPlaying(int totalPlayersPlaying)
        {
            Dictionary<int, WebSocket> players = new Dictionary<int, WebSocket>();

            int count = 0;
            foreach (var element in sockets)
            {
                if (count == totalPlayersPlaying) break;

                count += 1;

                players.Add(element.Key, element.Value);
            }

            return players;
        }

        public int AddSocket(WebSocket socket)
        {
            int playerID = IDFinder.FindAvailableID(sockets);

            sockets.TryAdd(playerID, socket);

            return playerID;
        }
    }
}
