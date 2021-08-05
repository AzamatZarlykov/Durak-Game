using System;
using System.Collections.Generic;
using System.Linq;

using DurakGame.Library.GameCard;

namespace DurakGame.Library.GameDeck
{
    public class Deck
    {
        public int cardsLeft => cards.Count;

        public List<Card> cards = new List<Card>();

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

        // Returns the card from the deck given the index
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

        // Returns the drawn card from the deck
        public Card DrawCard()
        {
            Card card = cards.First();
            cards.RemoveAt(0);
            return card;
        }

        // Returns the list of cards to draw to 6 cards
        public List<Card> DrawUntilSix(int numberOfCards)
        {
            List<Card> cardsToDraw = new List<Card>();

            for (int i = 0; i < 6 - numberOfCards; i++)
            {
                if (cardsLeft > 0)
                {
                    cardsToDraw.Add(DrawCard());
                }
            }
            return cardsToDraw;
        }
    }
}
