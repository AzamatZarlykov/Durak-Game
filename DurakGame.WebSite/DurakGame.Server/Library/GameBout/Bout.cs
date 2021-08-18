using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Library.GameCard;

namespace DurakGame.Library.Game
{
    /// <summary>
    /// Bout class is the gameplay at the center of the board
    /// </summary>
    public class Bout
    {
        private List<Card> attackingCards = new List<Card>();
        private List<Card> defendingCards = new List<Card>();
        public Bout() { }
        public int GetAttackingCardsSize() => attackingCards.Count();
        public int GetDefendingCardsSize() => defendingCards.Count();
        public List<Card> GetAttackingCards() => attackingCards;
        public List<Card> GetDefendingCards() => defendingCards;

        public Card GetAttackingCard(int index) => attackingCards[index];
        public bool CheckExistingRanks(Rank rank)
        {
            foreach (Card card in attackingCards)
            {
                if (card.rank == rank)
                {
                    return true;
                }
            }

            foreach (Card card in defendingCards)
            {
                if (card.rank == rank)
                {
                    return true;
                }
            }
            return false;
        }

        public bool CheckExistingSuits(Suit suit)
        {
            foreach (Card card in attackingCards)
            {
                if (card.suit == suit)
                {
                    return true;
                }
            }
            return false;
        }

        public void AddAttackingCard(Card card)
        {
            attackingCards.Add(card);
        }

        public void AddDefendingCard(Card card)
        {
            defendingCards.Add(card);
        }

        public void RemoveCardsFromBout()
        {
            attackingCards.Clear();
            defendingCards.Clear();
        }
    }
}
