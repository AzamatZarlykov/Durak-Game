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
        public readonly EnumRank rank;
        public readonly EnumSuit suit;

        public Card() { }
        public Card(EnumRank _rank, EnumSuit _suit)
        {
            rank = _rank;
            suit = _suit;
        }

        public override string ToString()
        {
            return "Card has a rank " + rank + " and suit " + suit + "s";
        }
    }
}
