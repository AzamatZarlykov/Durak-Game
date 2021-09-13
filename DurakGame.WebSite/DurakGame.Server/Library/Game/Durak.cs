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

        public Card trumpCard;

        public int prevDiscardedHeapValue;
        public bool discardHeapChanged;

        public bool takingCards;
        public int durak => game.GetDurak();
        public int discardHeapSize => game.GetDiscardedHeapSize();
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

            List<PlayerView> pViews = new List<PlayerView>();
            PlayerView playerView;

            if (prevDiscardedHeapValue != discardHeapSize)
            {
                discardHeapChanged = true;
            }
            prevDiscardedHeapValue = discardHeapSize;

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

            takingCards = game.takingCards;
        }
    }

    public abstract class Durak
    {
        protected Bout bout;
        protected Deck deck;
        protected Card trumpCard;

        public bool isBoutChanged;

        protected int defendingPlayer;
        protected int attackingPlayer;

        public bool takingCards;

        protected bool attackFinished;
        public bool defenseFinished;

        protected int durak;

        protected int discardedHeapSize;
        public bool GameInProgress => players.Count > 1;

        protected List<Player> players = new List<Player>();
         
        public Durak() { }

        public Card GetTrumpCard() => trumpCard;
        public Deck GetDeck() => deck;
        public int GetDiscardedHeapSize() => discardedHeapSize;
        public int GetDurak() => durak;
        public int GetDefendingPlayer() => defendingPlayer;
        public bool GetAttackFinished() => attackFinished;
        public bool GetDefenseFinished() => defenseFinished;
        public int GetAttackingPlayer() => attackingPlayer;
        public List<Player> GetPlayers() => players;
        public int GetSizeOfPlayers() => players.Count;
        public Bout GetBoutInformation() => bout;
        public bool IsBoutGoing() => bout.GetAttackingCardsSize() > 0;
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

            bout = new Bout();
        }

        public bool IsAttackerWinner() => !IsBoutGoing() && 
            players[attackingPlayer].GetPlayersHand().Count == 0;

        public void SetAttackFinished(bool value) => attackFinished = value;

        protected void GetNextPlayingPlayer(int increment)
        {
            attackingPlayer = (attackingPlayer + increment) % GetSizeOfPlayers();

            while (players[attackingPlayer].GetPlayersHand().Count == 0)
            {
                attackingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();
            }

            defendingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();

            while (players[defendingPlayer].GetPlayersHand().Count == 0)
            {
                defendingPlayer = (defendingPlayer + 1) % GetSizeOfPlayers();
            }
        }
        
        public abstract void ChangeBattle(bool successfulDefense);

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

        public abstract bool AttackingPhase(int cardIndex);
        

        public bool IsTrumpSuit(Card card)
        {
            return card.suit == trumpCard.suit;
        }

        protected bool IsLegalDefense(Card attackingCard, Card defendingCard)
        {
            return (defendingCard.suit == attackingCard.suit &&
                    defendingCard.rank > attackingCard.rank) ||
                    (IsTrumpSuit(defendingCard) && (!IsTrumpSuit(attackingCard) ||
                    (IsTrumpSuit(attackingCard) && defendingCard.rank >
                    attackingCard.rank)));
        }

        public abstract bool DefendingPhase(int cardIndex);
        
        public bool IsDefenseOver()
        {
            return bout.GetEverything().Count % 2 == 0;
        }
    }
}
