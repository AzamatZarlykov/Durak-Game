using System;
using System.Linq;
using System.Net.WebSockets;
using System.Collections.Generic;

namespace DurakGame.Server.Middleware
{
    public class ConnectionManager
    {
        // Keep track of users websockets connection. Indicies are the IDs of players
        private List<WebSocket> sockets = new List<WebSocket>();

        // This list is used to store the ids of players as a copy when the game
        // starts to lookup the ids of players when they leave. Without it, when 
        // removing the player from the sockets and players list, the index 
        // change, in other words, ids change as well.
        private List<WebSocket> startIDsOfPlayers = new List<WebSocket>();

        public int GetTotalPlayers() => sockets.Count;
        public int GetTotalPlayingPlayers() => startIDsOfPlayers.Count;

        public List<WebSocket> GetAllSockets() => sockets;
        public List<WebSocket> GetPlayingSockets() => startIDsOfPlayers;

        public void RemoveElementFromSockets(WebSocket socket)
        {
            sockets.Remove(socket);
        }

        public int GetIndexOfSocket(WebSocket socket)
        {
            return sockets.IndexOf(socket);
        }

        public bool IsSocketInTheGame(WebSocket socket)
        {
            return startIDsOfPlayers.IndexOf(socket) > -1;
        }

        // Reconnects the socket of players that just returned to lobby
        // by removing the elements from the copy list 
        public void ReconnectTheConnectionOfOldPlayers()
        {
            foreach (WebSocket socket in startIDsOfPlayers)
            {
                sockets.Remove(socket);
                sockets.Add(socket);
            }
            startIDsOfPlayers.Clear();
        }

        public List<WebSocket> GetFirstPlayersPlaying(int totalPlayersPlaying)
        {
            // assign playing players to the copy list. This is done to facilitate 
            // the order of players
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
    }
}
