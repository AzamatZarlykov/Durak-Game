using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GamePlayer.Hand;

namespace DurakGame.Server.Library.GamePlayer
{
    public class Player
    {
        private string name;

        // private Icon icon;

        private bool isAttacking;
        private bool isDefending; 

        private PlayerHand hand = new PlayerHand();
        
    }
}
