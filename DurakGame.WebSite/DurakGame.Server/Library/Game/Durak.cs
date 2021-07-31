using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GamePlayer;
using DurakGame.Server.Library.GameDeck;
using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.Game
{
    public class Durak
    {
        private readonly Deck deck;

        public Card trumpCard;

        public bool GameInProgress => players.Count() > 1;

        public List<Player> players = new List<Player>();

        public Durak()
        {

            deck = new Deck();
            deck.Shuffle();

            trumpCard = deck.GetCard(0);
        }

        public void RemovePlayer(int playerID)
        {

            for (int i = 0; i < players.Count; i++)
            {
                if (players[i].ID == playerID)
                {
                    players.Remove(players[i]);
                }
            }

        }
    }
}
