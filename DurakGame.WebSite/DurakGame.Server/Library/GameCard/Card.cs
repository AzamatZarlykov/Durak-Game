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
        public readonly EnumSuit suit;
        public readonly EnumRank rank;

        public Card() { }
        public Card(EnumSuit _suit, EnumRank _rank)
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
