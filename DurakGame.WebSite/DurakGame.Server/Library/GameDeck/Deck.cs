using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.GameDeck
{
    public class Deck : IDeck
    {
        private int cardsLeft;

        private Card trump = new Card();

        private List<Card> cards = new List<Card>();
    }
}
