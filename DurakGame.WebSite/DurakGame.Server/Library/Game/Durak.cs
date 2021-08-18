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

        private Durak game;

        public int discardHeapSize;

        public Card trumpCard;
        public int deckSize => game.GetDeck().cardsLeft;
        public int defendingPlayer => game.GetDefendingPlayer();
        public int attackingPlayer => game.GetAttackingPlayer();

        public List<PlayerView> playersView = new List<PlayerView>();
        public List<Card> attackingCards;
        public List<Card> defendingCards;


        public GameView(Durak game, int id)
        {
            this.game = game;

            List<Player> players = game.GetPlayers();
            
            playerID = id;
            hand = players[id].GetPlayersHand();

            discardHeapSize = 0;

            List<PlayerView> pViews = new List<PlayerView>();
            PlayerView playerView;

            for (int i = 0; i < game.GetSizeOfPlayers(); i++)
            {
                playerView = new PlayerView();

                playerView.numberOfCards = players[i].GetPlayersHand().Count;
                playerView.isAttacking = (attackingPlayer == i);

                pViews.Add(playerView);
            }
            playersView = pViews;

            trumpCard = deckSize == 0 ? new Card(game.GetTrumpCard().suit, (Rank)5) 
                                       : game.GetTrumpCard();

            attackingCards = game.GetBoutInformation().GetAttackingCards();
            defendingCards = game.GetBoutInformation().GetDefendingCards();
        }
    }

    public class Durak
    {
        private Bout myBout;
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
        public Bout GetBoutInformation() => myBout;
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

            myBout = new Bout();
        }

        public void RemovePlayer(int playerID)
        {
            players.RemoveAt(playerID);
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
                p.AddCardsToHand(deck.DrawUntilSix(0));
            }
        }

        // Function will find the player who has the card with
        // lowest rank of the trump card's suit.
        public void SetAttacker()
        {
            Player pl = null;
            Rank lowTrump = 0;

            foreach (Player p in players)
            {
                foreach (Card c in p.GetPlayersHand())
                {
                    if (c.suit == trumpCard.suit && (pl == null || 
                        c.rank < lowTrump))
                    {
                        pl = p;
                        lowTrump = c.rank;
                    }
                }
            }

            // If no player has a trump card then the first player
            // connected to the game will be the attacking player
            if (pl == null)
            {
                pl = players.First();
            }

            // e.g in the game of 3 players, if attacking player is 3
            // then defending is 1
            attackingPlayer = players.IndexOf(pl);
            defendingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();
        }


        public void AttackingPhase(int cardIndex)
        {
            if (cardIndex > 5) cardIndex = 5;

            Card attackingCard = players[attackingPlayer].GetPlayersHand()[cardIndex];
            // if no card is played then allow the attacking card
            if (myBout.GetAttackingCardsSize() == 0)
            {
                myBout.AddAttackingCard(attackingCard);
                players[attackingPlayer].RemoveCardFromHand(attackingCard);
            } else
            {
                if (myBout.CheckExistingRanks(attackingCard.rank))
                {
                    myBout.AddAttackingCard(attackingCard);
                    players[attackingPlayer].RemoveCardFromHand(attackingCard);
                }
            }
        }

        public bool IsTrumpSuit(Card card)
        {
            return card.suit == trumpCard.suit;
        }

        /*
            Defending phase works for the simple case when the attacking player
            attacks only by one card at the time
        */
        public void DefendingPhase(int cardIndex)
        {
            if (cardIndex > 5) cardIndex = 5;

            int attackCardIndex = myBout.GetAttackingCardsSize() - 1;

            Card defendingCard = players[defendingPlayer].GetPlayersHand()[cardIndex];
            Card currentCard = myBout.GetAttackingCard(attackCardIndex);

            if ((defendingCard.suit == currentCard.suit &&
                defendingCard.rank > currentCard.rank) ||
                (IsTrumpSuit(defendingCard) && (!IsTrumpSuit(currentCard) ||
                (IsTrumpSuit(currentCard) && defendingCard.rank >
                currentCard.rank))))
            {
                myBout.AddDefendingCard(defendingCard);
                players[defendingPlayer].RemoveCardFromHand(defendingCard);
            }
        }
    }
}
