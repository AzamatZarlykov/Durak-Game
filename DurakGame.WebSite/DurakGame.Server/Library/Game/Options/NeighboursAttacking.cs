using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DurakGame.Library.Game
{
    class NeighboursAttacking : Durak
    {
        public static bool secondAttackFinished;
        private bool secondAttackerIsAttackingPlayer;
        private int attackingPlayerOne;

        private void UpdateAttackingPlayer()
        {
            Console.WriteLine(attackingPlayer);
            Console.WriteLine();
            attackingPlayer = (defendingPlayer + 1) % GetSizeOfPlayers();
            Console.WriteLine(attackingPlayer);
            Console.WriteLine();
            while (players[attackingPlayer].GetPlayersHand().Count == 0)
            {
                attackingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();
            }
        }

        public override void ChangeBattle(bool successfulDefense)
        {
            // when the first player finishes the attack( when clicks the DONE button) or the
            // defender takes the first attacked card ask the attacker if he is DONE if no add
            // extra cards, if yes let the second attacker( the one on the left side of the defender)
            // to attack once the attack is over ask the right attacker again if there is anything
            // they want to add if yes, repeat the previous step if no then the bout is over and 
            // the change battle is called 

            Console.WriteLine("ATTACKING FINISHED " + attackFinished);
            Console.WriteLine();

            Console.WriteLine("SECOND ATTACK FINISHED " + secondAttackFinished );
            Console.WriteLine();

            Console.WriteLine("BOUT CHANGED ??  " + isBoutChanged);
            Console.WriteLine();

            if (successfulDefense)
            {
                if (isBoutChanged)
                {
                    isBoutChanged = false;
                    // The first player attacked and the bout changed
                    if (attackFinished)
                    {
                        secondAttackerIsAttackingPlayer = true;

                        attackingPlayerOne = attackingPlayer;

                        UpdateAttackingPlayer();
                    }
                    else if (secondAttackFinished)
                    {
                        secondAttackerIsAttackingPlayer = false;

                        attackingPlayer = attackingPlayerOne;
                    }
                }

                else if (defenseFinished || !isBoutChanged)
                {
                    defenseFinished = false;

                    if (secondAttackerIsAttackingPlayer)
                    {
                        attackingPlayer = attackingPlayerOne;
                    }

                    // add the cards for the second attacker

                    int attCards = bout.GetAttackingCardsSize();
                    int defCards = bout.GetAttackingCardsSize();

                    // refill the cards for attacking player 
                    if (deck.cardsLeft > 0)
                    {
                        // update the cards for both attacking players
                        deck.UpdatePlayersHand(players[attackingPlayer]);
                        UpdateAttackingPlayer();
                        deck.UpdatePlayersHand(players[attackingPlayer]);
                        attackingPlayer = attackingPlayerOne;
                    }

                    // refill the cards for defending player 
                    if (deck.cardsLeft > 0)
                    {
                        deck.UpdatePlayersHand(players[defendingPlayer]);
                    }

                    discardedHeapSize = discardedHeapSize + attCards + defCards;

                    bout.RemoveCardsFromBout();

                    GetNextPlayingPlayer(1);
                }
            }
            else
            {
                if (secondAttackerIsAttackingPlayer)
                {
                    attackingPlayer = attackingPlayerOne;
                }

                // refill the cards for attacking player 
                if (deck.cardsLeft > 0)
                {
                    // update the cards for both attacking players
                    deck.UpdatePlayersHand(players[attackingPlayer]);
                    UpdateAttackingPlayer();
                    deck.UpdatePlayersHand(players[attackingPlayer]);
                    attackingPlayer = attackingPlayerOne;
                }

                // add all the cards from the bout to the defending player
                players[defendingPlayer].AddCardsToHand(bout.GetEverything());

                bout.RemoveCardsFromBout();

                GetNextPlayingPlayer(2);
            } 
        }
    }
}
