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

        public List<Player> playingPlayers;

        public Durak()
        {
            gameInProgress = true;

            deck = new Deck();
            deck.Shuffle();

            trumpCard = deck.GetCard(0);
        }
    }
}
