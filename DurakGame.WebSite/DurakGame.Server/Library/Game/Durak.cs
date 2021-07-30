using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GamePlayer;
using DurakGame.Server.Library.GameDeck;
using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.Game
{
    public class Durak : IDurak
    {
        private readonly Deck deck;

        public Card trumpCard;

        public bool gameInProgress;

        public List<Player> playingPlayers = new List<Player>();

        public Durak()
        {

            deck = new Deck();
            deck.Shuffle();

            trumpCard = deck.GetCard(0);
        }

        public void RemovePlayer(int playerID)
        {
            for (int i = 0; i < playingPlayers.Count; i++)
            {
                if (playingPlayers[i].ID == playerID)
                {
                    Console.WriteLine("The player " + playingPlayers[i].ID + " was removed from the game");

                    playingPlayers.Remove(playingPlayers[i]);
                }
            }
        }
    }
}
