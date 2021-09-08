using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
            bout.RemoveCardsFromBout();
        }
    }
}
