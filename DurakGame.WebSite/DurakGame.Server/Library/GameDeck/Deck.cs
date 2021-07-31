using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.GameDeck
{
    public class Deck
    {
        public int CardsLeft => cards.Count;

        private Card trump = new Card();

        private List<Card> cards = new List<Card>();

        // initializes the deck by creating all the ranks with the corresponding suits
        public Deck()
        {
            for (int suit = 0; suit < 4; suit++)
            {
                for (int rank = 6; rank < 15; rank++)
                {
                    cards.Add(new Card((Suit)suit, (Rank)rank));
                }
            }
        }

        public int Length() => cards.Count();

        // Shuffles the deck of cards using Fisher-Yates shuffle
        // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        public void Shuffle()
        {
            Random rGen = new Random();

            for (int i = cards.Count() - 1; i > 0; i--)
            {
                int indexGen = rGen.Next(i + 1);
                (cards[i], cards[indexGen]) = (cards[indexGen], cards[i]);
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
