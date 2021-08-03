using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DurakGame.Server.Library.GamePlayer;
using DurakGame.Server.Library.GameDeck;
using DurakGame.Server.Library.GameCard;

namespace DurakGame.Server.Library.Game
{
    public class Durak
    {
        private Deck deck;

        private Card trumpCard;

        public bool GameInProgress => players.Count > 1;

        private List<Player> players = new List<Player>();

        public Durak()
        {

        }

        public int GiveSizeOfPlayers() => players.Count;

        public void StartGame(int totalPlayers)
        {
            deck = new Deck();
            deck.Shuffle();
            // the last card is the trump card(the one at the bottom face up)
            trumpCard = deck.GetCard(deck.cardsLeft - 1);

            for (int i = 0; i < totalPlayers; i++)
            {
                Player p = new Player();
                players.Add(p);
            }

            foreach (Player p in players)
            {
                p.playersHand = deck.DrawUntilSix(0);
            }


            // Check the cards of the players
            int count = 1;

            Console.WriteLine("The trump of the game is " + trumpCard.rank + trumpCard.suit);
            foreach (Player p in players)
            {
                Console.WriteLine("The player " + count + " cards are: ");
                count++;
                p.PrintCards();
            }


            SetAttacker();

            
            count = 1;
            foreach (Player p in players)
            {
                if (p.isAttacking)
                {
                    Console.WriteLine("The attacking player is " + count);
                }
                count++;
            }
        }

        // Function will find the player who has the card with
        // lowest rank of the trump card's suit
        public void SetAttacker()
        {
            Dictionary<Player, Rank> lowestCards = new Dictionary<Player, Rank>();

            foreach (Player p in players)
            {
                var trumpCards = from card in p.playersHand 
                                 where card.suit == trumpCard.suit 
                                 orderby card.rank 
                                 select card.rank;

                lowestCards.Add(p, trumpCards.FirstOrDefault());
            }

            var sortedDict = from entry in lowestCards orderby entry.Value ascending select entry;

            Player pl = sortedDict.First().Key;
            pl.isAttacking = true;
            pl.isDefending = false;

            foreach (var entry in sortedDict.Skip(1))
            {
                pl = entry.Key;
                pl.isAttacking = false;
                pl.isDefending = true;
            }
        }

        public void RemovePlayer(int playerID)
        {
            players.RemoveAt(playerID);
        }
    }
}
