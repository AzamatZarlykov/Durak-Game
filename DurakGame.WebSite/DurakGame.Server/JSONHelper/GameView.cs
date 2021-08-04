using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Helper
{
    public class GameView
    {
        // Information about the player
        public bool isAttacking;
        public bool isDefending;
        public List<Card> hand;

        // Information about other players and the game
        public int deckSize;
        public int discardHeapSize;
        // Add how many cards does each player have 
        // [4,7,2,6] 
        public List<int> opponentsCards = new List<int>();
    }
}
