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
        // private Dictionary<int, WebSocket> sockets = new Dictionary<int, WebSocket>();

        private List<WebSocket> sockets = new List<WebSocket>();

        // This list is used to store the ids of players as a copy when the game
        // starts to lookup the ids of players when they leave. Without it, when 
        // removing the player from the sockets and players list, the index 
        // change, in other words, ids change as well.
        private List<WebSocket> startIDsOfPlayers = new List<WebSocket>();

        public int GetTotalPlayers() => sockets.Count;

        public List<WebSocket> GetAllSockets() => sockets;

        public List<WebSocket> GetPlayingSockets() => startIDsOfPlayers;    
        public void RemoveElementFromSockets(WebSocket socket)
        {
            sockets.Remove(socket);
        }

        public List<WebSocket> GetFirstPlayersPlaying(int totalPlayersPlaying)
        {
            startIDsOfPlayers = sockets.Take(totalPlayersPlaying).ToList();
            return startIDsOfPlayers;
        }

        // returns true if the socket given is the one playing the game
        // otherwise, returns false if the socket connected after the game started
        public bool IsPlayingSocket(WebSocket socket)
        {
            return startIDsOfPlayers.Contains(socket);
        }

        public void AddSocket(WebSocket socket)
        {
            sockets.Add(socket);
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
