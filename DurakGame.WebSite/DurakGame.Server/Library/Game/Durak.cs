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

            // add players
            AddPlayers(totalPlayers);

            // Each player draws 6 cards
            DistributeCardsToPlayers();

            // Set the attacking player
            SetAttacker();

        }

        public void AddPlayers(int totalPlayers)
        {
            for (int i = 0; i < totalPlayers; i++)
            {
                Player p = new Player();
                players.Add(p);
            }
        }

        public void DistributeCardsToPlayers()
        {
            foreach (Player p in players)
            {
                p.playersHand = deck.DrawUntilSix(0);
            }
        }

        // Function will find the player who has the card with
        // lowest rank of the trump card's suit.
        public void SetAttacker()
        {
            Player pl = null;
            Rank lowTrump = 0;
            bool isAttackingSet = false;

            foreach (Player p in players)
            {
                foreach (Card c in p.playersHand)
                {
                    if (c.suit == trumpCard.suit && (pl == null || c.rank < lowTrump))
                    {
                        pl = p;
                        lowTrump = c.rank;
                        isAttackingSet = true;
                    }
                }
            }

            // If no player has a trump card then the first player
            // connected to the game will be the attacking player
            if (!isAttackingSet)
            {
                pl = players.First();
            }

            pl.isAttacking = true;
            pl.isDefending = false;

            foreach (Player p in players)
            {
                if (p != pl)
                {
                    p.isAttacking = false;
                    p.isDefending = true;
                }
            }
        }

        public void RemovePlayer(int playerID)
        {
            players.RemoveAt(playerID);
        }
    }
}
