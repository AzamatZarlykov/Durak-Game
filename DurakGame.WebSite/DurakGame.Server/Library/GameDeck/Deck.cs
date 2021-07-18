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

        // initializes the deck by creating all the ranks with the corresponding suits
        public Deck()
        {
            for (int suit = 0; suit < 4; suit++)
            {
                for (int rank = 0; rank < 9; rank++)
                {
                    cards.Add(new Card((EnumSuit)suit, (EnumRank)rank));
                }
            }
        }

        public int Length() => cards.Count();

        // Shuffles the deck of cards using Fisher-Yates shuffle
        // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        public void Shuffle()
        {
            Card cardTemp;
            Random rGen = new Random();

            for (int i = cards.Count() - 1; i > 0; i--)
            {
                int indexGen = rGen.Next(i + 1);
                cardTemp = cards[i];
                cards[i] = cards[indexGen];
                cards[indexGen] = cardTemp;
            }
        }

        // Returns the card from the deck
        public Card GetCard(int index)
        {
            try
            {
                return cards[index];
            } 
            catch (ArgumentOutOfRangeException)
            {
                throw (new ArgumentOutOfRangeException("index", index, "Card should be between 0 and 35"));
            }
        }
    }
}
