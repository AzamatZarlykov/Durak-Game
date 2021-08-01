using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.GamePlayer
{
    public class Player
    {
        public string name;

        // private Icon icon;

        public bool isAttacking;

        public bool isDefending;

        public List<Card> playersHand = new List<Card>();

    }
}
