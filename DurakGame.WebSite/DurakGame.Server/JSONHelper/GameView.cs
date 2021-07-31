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
        public int id;
        public bool isAttacking;
        public bool isDefending;
        public List<Card> hand;

        // Information about other players and the game
        public int DeckSize;
        public int DiscardHeapSize;
        // Add how many cards does each player have 
    }
}
