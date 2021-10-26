using System;
using System.Collections.Generic;
using System.Linq;

using DurakGame.Library.GamePlayer;
using DurakGame.Library.GameDeck;
using DurakGame.Library.GameCard;

namespace DurakGame.Library.Game
{
    public enum Type { OneSideAttacking, NeighboursAttacking, AllSidesAttacking }
    public enum MoveResult { OK, OutOfTurn, IllegalMove, TookCards }
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

        private int prevDiscardedHeapValue;
        public bool discardHeapChanged;

        public int durak;
        public int playerTurn;

        public bool takingCards;
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

            takingCards = game.taking;

            playerTurn = game.GetPlayersTurn();

            durak = game.durak;
        }
    }

    public class Durak
    {
        protected Bout bout;
        protected Deck deck;
        protected Card trumpCard;

        public bool isBoutChanged;
        public bool taking;

        protected int defendingPlayer;
        protected int attackingPlayer;

        public bool attackerTurn;

        public Type type = Type.AllSidesAttacking;

        public int durak;
        public int totalUninterruptedDone;

        private int discardedHeapSize;
        // public bool GameInProgress => players.Count > 1;
        public bool gameInProgress;

        protected List<Player> players = new List<Player>();

        public int allAttackingPlayersIndex;
        private List<int> allAttackingPlayers = new List<int>();
        public Durak() { }

        public Card GetTrumpCard() => trumpCard;
        public Deck GetDeck() => deck;
        public int GetDiscardedHeapSize() => discardedHeapSize;
        public int GetDefendingPlayer() => defendingPlayer;
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

            GetAttackers();

            attackerTurn = true;

            bout = new Bout();
        }

        public bool IsAttackerWinner() => !IsBoutGoing() && 
            players[attackingPlayer].GetPlayersHand().Count == 0;


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


        public bool IsTrumpSuit(Card card)
        {
            return card.suit == trumpCard.suit;
        }

        public bool IsLegalDefense(Card attackingCard, Card defendingCard)
        {
            return (defendingCard.suit == attackingCard.suit &&
                    defendingCard.rank > attackingCard.rank) ||
                    (IsTrumpSuit(defendingCard) && (!IsTrumpSuit(attackingCard) ||
                    (IsTrumpSuit(attackingCard) && defendingCard.rank >
                    attackingCard.rank)));
        }

        public bool IsDefenseOver()
        {
            return bout.GetEverything().Count % 2 == 0;
        }

        // Check if the attacking player can attack with the card that they have based on cards on 
        // the bout 
        public bool IsAttackPossible()
        {
            foreach (Card c in bout.GetEverything())
            {
                if (players[attackingPlayer].GetPlayersHand().Exists(card => card.rank == c.rank))
                {
                    return true;
                }
            }
            return false;
        }

        // Checks if the defending player can defend the attacking card with their hand of cards
        public bool IsDefensePossible()
        {
            int attackCardIndex = bout.GetAttackingCardsSize() - 1;

            Card attackingCard = bout.GetAttackingCard(attackCardIndex);

            foreach (Card defendingCard in players[defendingPlayer].GetPlayersHand())
            {
                if (IsLegalDefense(attackingCard, defendingCard))
                {
                    return true;
                }
            }
            return false;
        }

        private void GetNextPlayingPlayer(int increment)
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


        private int GetNextAttackingPlayerIndex(int relativePlayer)
        {
            int newAttackingPlayer = (relativePlayer + 1) % GetSizeOfPlayers();
            while (players[newAttackingPlayer].GetPlayersHand().Count == 0)
            {
                newAttackingPlayer = (newAttackingPlayer + 1) % GetSizeOfPlayers();
            }
            return newAttackingPlayer;
        }

        private void UpdateDiscardedPile()
        {
            int attCards = bout.GetAttackingCardsSize();
            int defCards = bout.GetDefendingCardsSize();

            discardedHeapSize = discardedHeapSize + attCards + defCards;
        }

        // Returns the list of attacking player based on the type of Durak
        public void GetAttackers()
        {
            allAttackingPlayers.Clear();
            allAttackingPlayers.Add(attackingPlayer);

            switch (type)
            {
                case Type.OneSideAttacking:
                    break;
                case Type.NeighboursAttacking:
                    allAttackingPlayers.Add(GetNextAttackingPlayerIndex(defendingPlayer));
                    break;
                case Type.AllSidesAttacking:

                    for (int i = 1; i < players.Count; i++)
                    {
                        int index = (attackingPlayer + i) % players.Count;
                        if (index == defendingPlayer || players[index].GetPlayersHand().Count == 0)
                        {
                            continue;
                        }
                        allAttackingPlayers.Add(index);
                    }
                    break;
            }
        }

        // Resets the round i.e distributes the cards to attacking players, based on bool taking,
        // distribute bout cards to defending player or remove to discarded pile, and get next 
        // players that will play
        private void ResetRound()
        {
            // update the cards for all attacking players until the deck is empty
            for (int i = 0; i < allAttackingPlayers.Count && deck.cardsLeft != 0; i++)
            {
                deck.UpdatePlayersHand(players[allAttackingPlayers[i]]);
            }
            // set the initial attacking player
            attackingPlayer = allAttackingPlayers[0];

            if (taking)
            {
                taking = false;
                // add all the cards from the bout to the defending player
                players[defendingPlayer].AddCardsToHand(bout.GetEverything());
                GetNextPlayingPlayer(2);
            }
            else
            {
                // refill the cards for defending player 
                if (deck.cardsLeft > 0)
                {
                    deck.UpdatePlayersHand(players[defendingPlayer]);
                }

                UpdateDiscardedPile();

                GetNextPlayingPlayer(1);
            }

            bout.RemoveCardsFromBout();
        }

        // function that controls the flow of the game: assigns new attacking/defending players
        // based on the outcome of the bout. 
        private void ChangeBattle(bool took)
        {
            // If any card was played by attacking player and done button was pressed
            if (isBoutChanged)
            {
                totalUninterruptedDone = 1;
                isBoutChanged = false;
                // if defending player took the cards, decrement totalUninteruptedDone to
                // avoid completing the bout. Also, decrement allAttackingPlayersIndex to ask the
                // same player if there any cards to be added
                if (took)
                {
                    taking = true;
                    totalUninterruptedDone -= 1;
                    allAttackingPlayersIndex -= 1;
                }
            }
            // this statement takes care the situation if the player pressed done and added no cards
            else if (!isBoutChanged)
            {
                totalUninterruptedDone += 1;
            }
            // if all attacking players pressed done then it implies that bout is over no matter if 
            // the defending player took the cards or defended successfully
            if (totalUninterruptedDone == allAttackingPlayers.Count)
            {
                ResetRound();
                // Get new list of attacking player as the round of attack finished
                GetAttackers();
                allAttackingPlayersIndex = 0;
            }
            else
            {
                // update the current attacking player
                allAttackingPlayersIndex = (allAttackingPlayersIndex + 1) %
                            allAttackingPlayers.Count;
                attackingPlayer = allAttackingPlayers[allAttackingPlayersIndex];

                // if defending player TAKEs cards then check if new attacking player can add any 
                // cards to the bout. If not then skip his turn to the next attacking player. 
                if (taking && !IsAttackPossible())
                {
                    ChangeBattle(false);
                }
            }
            attackerTurn = true;
        }

        // controls flow of the game when the attacking player presses DONE. 
        public void AttackerDone() { ChangeBattle(false); }

        // controls the flow of the game when the defending player takes the cards
        public void DefenderTake() { ChangeBattle(true); }

        public MoveResult DefenderMove(int cardIndex)
        {
            if (!taking)
            {
                // wait for the attack
                if (attackerTurn)
                {
                    return MoveResult.OutOfTurn;
                }

                int attackCardIndex = bout.GetAttackingCardsSize() - 1;

                Card attackingCard = bout.GetAttackingCard(attackCardIndex);
                Card defendingCard = players[defendingPlayer].GetPlayersHand()[cardIndex];

                if (!IsLegalDefense(attackingCard, defendingCard))
                {
                    return MoveResult.IllegalMove;
                }

                bout.AddDefendingCard(defendingCard);
                players[defendingPlayer].RemoveCardFromHand(defendingCard);

                // set defense finished to true
                attackerTurn = true;

                return MoveResult.OK;
            }
            return MoveResult.TookCards;
        }

        public MoveResult AttackerMove(int cardIndex)
        {
            // if the attack started wait for the defense
            if (!attackerTurn)
            {
                return MoveResult.OutOfTurn;
            }

            Card attackingCard = players[attackingPlayer].GetPlayersHand()[cardIndex];

            if (bout.GetAttackingCardsSize() == 0 || bout.ContainsRank(attackingCard.rank))
            {
                bout.AddAttackingCard(attackingCard);
                players[attackingPlayer].RemoveCardFromHand(attackingCard);

                isBoutChanged = true;

                if (!taking)
                {
                    attackerTurn = false;
                }
                return MoveResult.OK;
            }
            else
            {
                return MoveResult.IllegalMove;
            }
        }

        private bool IsDefenderTurn()
        {
            if (!taking)
            {
                return bout.GetAttackingCardsSize() > bout.GetDefendingCardsSize();
            }
            return false;
        }

        public int GetPlayersTurn()
        {
            if (IsDefenderTurn())
            {
                return defendingPlayer;
            }
            return attackingPlayer;
        }
    }
}