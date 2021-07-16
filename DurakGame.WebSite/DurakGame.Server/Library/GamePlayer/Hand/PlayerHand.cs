using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.GamePlayer.Hand
{
    public class PlayerHand
    {
        private int cardsLeft;

        private bool isDone;

        private List<Card> playerHand = new List<Card>();
    }
}
