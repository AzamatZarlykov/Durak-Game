using System;
using System.Collections.Generic;

using DurakGame.Library.GameCard;

namespace DurakGame.Library.GamePlayer
{
    public class Player
    {
        public string name;

        // private Icon icon;

        public List<Card> playersHand = new List<Card>();

        public void PrintCards()
        {
            foreach (Card c in playersHand)
            {
                Console.WriteLine("The rank : " + c.rank + ". The suit : " + c.suit);
            }
        }
    }
}
