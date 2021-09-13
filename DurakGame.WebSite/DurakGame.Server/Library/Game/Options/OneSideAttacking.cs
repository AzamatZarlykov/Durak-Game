using System;
using System.Collections.Generic;
using System.Linq;

using DurakGame.Library.GameCard;

namespace DurakGame.Library.Game
{
    public class OneSideAttacking : Durak
    {
        public override void ChangeBattle(bool successfulDefense)
        {
            int attCards = bout.GetAttackingCardsSize();
            int defCards = bout.GetAttackingCardsSize();

            if (successfulDefense)
            {
                // refill the cards for attacking player 
                if (deck.cardsLeft > 0)
                {
                    deck.UpdatePlayersHand(players[attackingPlayer]);
                }
                // refill the cards for defending player 
                if (deck.cardsLeft > 0)
                {
                    deck.UpdatePlayersHand(players[defendingPlayer]);
                }

                discardedHeapSize = discardedHeapSize + attCards + defCards;

                GetNextPlayingPlayer(1);
            }
            else
            {
                // refill the cards for attacking player 
                if (deck.cardsLeft > 0)
                {
                    deck.UpdatePlayersHand(players[attackingPlayer]);
                }

                // add all the cards from the bout to the defending player
                players[defendingPlayer].AddCardsToHand(bout.GetEverything());

                GetNextPlayingPlayer(2);
            }
            attackFinished = false;
            defenseFinished = false;
            takingCards = false;

            bout.RemoveCardsFromBout();
        }

        public override bool AttackingPhase(int cardIndex)
        {
            // if the attack started wait for the defense
            if (!IsDefenseOver() && !takingCards)
            {
                return false;
            }

            Card attackingCard = players[attackingPlayer].GetPlayersHand()[cardIndex];

            if (bout.GetAttackingCardsSize() == 0 || bout.CheckExistingRanks(attackingCard.rank))
            {
                bout.AddAttackingCard(attackingCard);
                players[attackingPlayer].RemoveCardFromHand(attackingCard);

                attackFinished = true;
                defenseFinished = false;

                return true;
            } else
            {
                return false;
            }
        }

        public override bool DefendingPhase(int cardIndex)
        {
            // wait for the attack
            if (!attackFinished)
            {
                return false;
            }
           
            int attackCardIndex = bout.GetAttackingCardsSize() - 1;

            Card attackingCard;
            Card defendingCard = players[defendingPlayer].GetPlayersHand()[cardIndex];


            attackingCard = bout.GetAttackingCard(attackCardIndex);

            
            if (!IsLegalDefense(attackingCard, defendingCard))
            {
                return false;
            }

            bout.AddDefendingCard(defendingCard);
            players[defendingPlayer].RemoveCardFromHand(defendingCard);
            // set defense finished to true
            attackFinished = false;
            defenseFinished = true;

            return true;
        }
    }
}
