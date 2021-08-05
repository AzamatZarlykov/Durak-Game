using System;
using System.Collections.Generic;
using System.Linq;

using DurakGame.Library.GamePlayer;
using DurakGame.Library.GameDeck;
using DurakGame.Library.GameCard;

namespace DurakGame.Library.Game
{
    public class PlayerView
    {
        public int numberOfCards;
        public bool isAttacking;
    }

    public class GameView
    {
        public int playerID;

        public List<Card> hand = new List<Card>();

        // Information about other players and the game
        public Card trumpCard;
        public int deckSize;
        public int discardHeapSize;

        public int defendingPlayer;
        public int attackingPlayer;

        public List<PlayerView> playersView = new List<PlayerView>();

        public GameView(Durak game, int id)
        {
            List<Player> players = game.GetPlayers();

            playerID = id;

            hand = players[id].playersHand;

            trumpCard = game.GetTrumpCard();
            deckSize = game.GetDeck().cardsLeft;
            discardHeapSize = 0;

            defendingPlayer = game.GetDefendingPlayer();
            attackingPlayer = game.GetAttackingPlayer();

            List<PlayerView> pViews = new List<PlayerView>();
            PlayerView playerView;
            
            for (int i = 0; i < game.GetSizeOfPlayers(); i++)
            {
                playerView = new PlayerView();
                playerView.numberOfCards = players[i].playersHand.Count;

                if (attackingPlayer == i)
                {
                    playerView.isAttacking = true;
                } else
                {
                    playerView.isAttacking = false;
                }
                pViews.Add(playerView);
            }
            playersView = pViews;
        }
    }

    public class Durak
    {
        private Deck deck;

        private Card trumpCard;

        private int defendingPlayer;

        private int attackingPlayer;

        public bool GameInProgress => players.Count > 1;

        private List<Player> players = new List<Player>();

        public Durak() { }

        public Card GetTrumpCard() => trumpCard;
        public Deck GetDeck() => deck;
        public int GetDefendingPlayer() => defendingPlayer;
        public int GetAttackingPlayer() => attackingPlayer;
        public List<Player> GetPlayers() => players;
        public int GetSizeOfPlayers() => players.Count;

        // function that returns the list of opponents cards size
        public List<int> GetOpponentsCards(int excludePlayerID)
        {
            List<int> opponentsCards = new List<int>();
            for (int i = 0; i < players.Count; i++)
            {
                if (i != excludePlayerID)
                {
                    opponentsCards.Add(players[i].playersHand.Count);
                }
            }
            return opponentsCards;
        }

        public void StartGame(int totalPlayers)
        {
            deck = new Deck();
            deck.Shuffle();
            // the last card is the trump card(the one at the bottom face up)
            trumpCard = deck.GetCard(0);

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

            // e.g in the game of 3 players, if attacking player is 3
            // then defending is 1
            attackingPlayer = players.IndexOf(pl);
            defendingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();
        }

        public void RemovePlayer(int playerID)
        {
            players.RemoveAt(playerID);
        }
    }
}
