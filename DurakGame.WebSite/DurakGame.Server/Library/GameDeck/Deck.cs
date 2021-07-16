using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.Deck
{
    public class Deck
    {
        private int cardsLeft;

        private Card trump = new Card();

        private List<Card> cards = new List<Card>();
    }
}
