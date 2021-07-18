using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GamePlayer.Hand;

namespace DurakGame.Server.Library.GamePlayer
{
    public class Player
    {
        public string Name { get; set; }
        public int ID { get; set; }

        // private Icon icon;

        public bool IsAttacking { get; set; }
        public bool IsDefending { get; set; }

        private PlayerHand hand = new PlayerHand();
        
    }
}
