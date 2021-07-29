using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DurakGame.Server.Library.GameCard
{
    /// <summary>
    /// Card class that represents the card in Durak
    /// </summary>
    public class Card : ICard
    {
        public readonly Suit suit;
        public readonly Rank rank;

        public Card() { }
        public Card(Suit _suit, Rank _rank)
        {
            suit = _suit;
            rank = _rank;
        }

        public override string ToString()
        {
            return "Card has a rank " + rank + " and suit " + suit + "s";
        }
    }
}
