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

        private Card TrumpCard { get; set; }

        public bool GameInProgress { get; set; }

        public List<Player> PlayingPlayers { get; set; }

        public Durak()
        {
            GameInProgress = true;

            deck = new Deck();
            deck.Shuffle();

            TrumpCard = deck.GetCard(0);
        }
    }
}
