using DurakGame.Library.GameCard;
using DurakGame.Library.GameDeck;
using DurakGame.Library.GamePlayer;
using DurakGame.Server.Middleware;

using System;
using System.Collections.Generic;
using System.Linq;

namespace DurakGame.Library.Game
{
    public enum AttackType { OneSideAttacking, NeighboursAttacking, AllSidesAttacking }
    public enum Variation { Classic, Passport }
    public enum MoveResult
    {
        OK, OutOfTurn, IllegalMove, TookCards, ExtraCard,
        GameIsOver, PassportViolation, UseDisplayButton
    }
    public enum GameStatus { NotCreated, GameInProcess, GameOver }
    public enum PassportCards
    {
        Six = 6, Ten = 10, Jack = 11, Queen = 12, King = 13, Ace = 14
    }
    public class PlayerView
    {
        public int numberOfCards;
        public bool isAttacking;
        public bool allCardsPassport;
        public PlayerState playerState;
        public PassportCards passport;
    }

    public class GameView
    {
        private Durak game;

        public int playerID;
        public List<Card> hand = new List<Card>();

        public Card trumpCard;

        private int prevDiscardedHeapValue;
        public bool discardHeapChanged;

        public GameStatus gameStatus;
        public int playerTurn;

        public bool takingCards;
        public int discardHeapSize => game.GetDiscardedHeapSize();
        public int deckSize => game.GetDeck().cardsLeft;
        public int defendingPlayer => game.GetDefendingPlayer();
        public int attackingPlayer => game.GetAttackingPlayer();

        public List<PlayerView> playersView = new List<PlayerView>();
        public List<Card> attackingCards;
        public List<Card> defendingCards;

        public Variation variation;
        public bool passportGameOver;

        public GameView(Durak game, int id)
        {
            this.game = game;
            variation = game.variation;

            List<Player> players = game.GetPlayers();

            playerID = id;
            hand = players[id].GetPlayersHand();

            if (prevDiscardedHeapValue != discardHeapSize)
            {
                discardHeapChanged = true;
            }
            prevDiscardedHeapValue = discardHeapSize;

            PlayerView playerView;
            List<PlayerView> pViews = new List<PlayerView>();


            for (int i = 0; i < game.GetSizeOfPlayers(); i++)
            {
                playerView = new PlayerView();

                playerView.numberOfCards = players[i].GetNumberOfCards();
                playerView.isAttacking = (attackingPlayer == i);
                playerView.playerState = players[i].playerState;
                playerView.passport = players[i].passport;

                if (players[i].playerState == PlayerState.Winner)
                {
                    passportGameOver = true;
                }

                if (variation == Variation.Passport && players[i].CheckIfAllCardsPassport())
                {
                    playerView.allCardsPassport = true;
                }

                pViews.Add(playerView);
            }
            playersView = pViews;

            trumpCard = deckSize == 0 ? new Card(game.GetTrumpCard().suit, (Rank)5)
                                       : game.GetTrumpCard();

            attackingCards = game.GetBoutInformation().GetAttackingCards();
            defendingCards = game.GetBoutInformation().GetDefendingCards();

            takingCards = game.GetPlayer(defendingPlayer).IsPlayerTaking();

            playerTurn = game.GetPlayersTurn();
            gameStatus = game.gameStatus;
        }
    }

    public class Durak
    {
        private Bout bout;
        private Deck deck;
        private Card trumpCard;

        private int defendingPlayer;
        private int attackingPlayer;

        public AttackType type;
        public Variation variation;

        public GameStatus gameStatus;
        public int totalUninterruptedDone;

        private int discardedHeapSize;

        private List<Player> players = new List<Player>();

        public int allAttackingPlayersIndex;
        private List<int> allAttackingPlayers = new List<int>();
        public Durak() { }

        public Card GetTrumpCard() => trumpCard;
        public Deck GetDeck() => deck;
        public int GetDiscardedHeapSize() => discardedHeapSize;
        public int GetDefendingPlayer() => defendingPlayer;
        public int GetAttackingPlayer() => attackingPlayer;
        public List<Player> GetPlayers() => players;
        public Player GetPlayer(int index) => players[index];
        public int GetSizeOfPlayers() => players.Count;
        public Bout GetBoutInformation() => bout;

        public void DistributeCardsToPlayers()
        {
            foreach (Player p in players)
            {
                p.AddCardsToHand(deck.DrawUntilSix(0));
            }

        }

        // Returns the list of attacking player based on the type of Durak
        public void GetAttackers()
        {
            allAttackingPlayers.Clear();
            allAttackingPlayers.Add(attackingPlayer);

            switch (type)
            {
                case AttackType.OneSideAttacking:
                    break;
                case AttackType.NeighboursAttacking:
                    allAttackingPlayers.Add(GetNextAttackingPlayerIndex(defendingPlayer));
                    break;
                case AttackType.AllSidesAttacking:

                    for (int i = 1; i < players.Count; i++)
                    {
                        int index = (attackingPlayer + i) % players.Count;
                        if (index == defendingPlayer || GetPlayer(index).GetNumberOfCards() == 0)
                        {
                            continue;
                        }
                        allAttackingPlayers.Add(index);
                    }
                    break;
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

            GetPlayer(attackingPlayer).SetIsAttackersTurn(true);
            // Set the list of attackers with all the attacking players
            // based on the type of the game
            GetAttackers();
        }


        public void StartGame()
        {
            deck = new Deck();
            deck.Shuffle();

            // the last card is the trump card(the one at the bottom face up)
            trumpCard = deck.GetCard(0);

            // Each player draws 6 cards
            DistributeCardsToPlayers();

            // Set the attacking player
            SetAttacker();

            bout = new Bout();
        }

        public void AddPlayers(int totalPlayers)
        {
            for (int i = 0; i < totalPlayers; i++)
            {
                Player p = new Player();
                players.Add(p);
            }
        }

        public void InstantiateGameSession(int totalPlayers)
        {
            gameStatus = GameStatus.GameInProcess;
            // add players
            AddPlayers(totalPlayers);
        }

        // Passport Variation Round reset
        public void ResetPassportRound()
        {
            // game status
            gameStatus = GameStatus.GameInProcess;

            discardedHeapSize = 0;

            // reset playher status
            foreach (Player p in players)
            {
                p.Reset();
            }

            // Deck
            StartGame();
        }

        public void Reset()
        {
            gameStatus = GameStatus.NotCreated;
            discardedHeapSize = 0;

            // reset the players list
            players.Clear();
            // reset set of attacking players
            allAttackingPlayersIndex = 0;
            allAttackingPlayers.Clear();
        }

        // returns how many players are still playing (have cards in the game)
        private int GetSizeOfPlayingPlayers()
        {
            int total = 0;
            foreach (Player p in players)
            {
                if (p.playerState == PlayerState.Playing)
                {
                    total += 1;
                }
            }
            return total;
        }

        public string[] GetUserNames()
        {
            string[] names = new string[GetSizeOfPlayers()];
            for (int i = 0; i < GetSizeOfPlayers(); i++)
            {
                names[i] = GetPlayer(i).GetPlayersName();
            }
            return names;
        }

        public int[] GetIcons()
        {
            int[] icons = new int[GetSizeOfPlayers()];
            for (int i = 0; i < GetSizeOfPlayers(); i++)
            {
                icons[i] = GetPlayer(i).GetPlayersIcon();
            }
            return icons;
        }

        public int GetNumberOfReadyPlayers()
        {
            int total = 0;
            foreach (Player p in players)
            {
                if (p.waitingRoomState == WaitingRoomState.Ready)
                {
                    total += 1;
                }
            }
            return total;
        }

        public bool IsUserNameAvailable(string name)
        {
            return Array.IndexOf(GetUserNames(), name) == -1;
        }

        public void AssignUserName(string name, int index)
        {
            GetPlayer(index).SetPlayerName(name);
            Console.Write("SERVER: USERNAMES => ");
            foreach (var v in GetUserNames())
            {
                Console.Write(v + " ");
            }
            Console.WriteLine();
        }

        public void AssignIcon(int number, int index)
        {
            GetPlayer(index).SetPlayerIcon(number);
            Console.Write("SERVER: ICONS => ");
            foreach (var v in GetIcons())
            {
                Console.Write(v + " ");
            }
            Console.WriteLine();
        }

        // Sets up the variation of Durak: Classic or Passport 
        public void SetupGameVariation(int variationIndex)
        {
            variation = (Variation)variationIndex;
            Console.WriteLine("The Variation is " + variation);
        }

        // Sets up the type of Durak: One side, neighbours or all side attacking 
        public void SetupGameType(int typeIndex)
        {
            type = (AttackType)typeIndex;
            Console.WriteLine("The Type is " + type);
        }

        public void RemovePlayer(int playerID)
        {
            players.RemoveAt(playerID);
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
                if (GetPlayer(attackingPlayer).GetPlayersHand().Exists(card => card.rank == c.rank))
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

            foreach (Card defendingCard in GetPlayer(defendingPlayer).GetPlayersHand())
            {
                if (IsLegalDefense(attackingCard, defendingCard))
                {
                    return true;
                }
            }
            return false;
        }

        private void GetNextPlayingPlayer(int increment, bool defTaking)
        {
            attackingPlayer = (attackingPlayer + increment) % GetSizeOfPlayers();

            while (GetPlayer(attackingPlayer).GetNumberOfCards() == 0 ||
                  (GetSizeOfPlayingPlayers() > 1 && defendingPlayer == attackingPlayer &&
                   defTaking))
            {
                attackingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();
            }

            defendingPlayer = (attackingPlayer + 1) % GetSizeOfPlayers();

            while (GetPlayer(defendingPlayer).GetNumberOfCards() == 0)
            {
                defendingPlayer = (defendingPlayer + 1) % GetSizeOfPlayers();
            }
        }


        private int GetNextAttackingPlayerIndex(int relativePlayer)
        {
            int newAttackingPlayer = (relativePlayer + 1) % GetSizeOfPlayers();
            while (GetPlayer(newAttackingPlayer).GetNumberOfCards() == 0)
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

        // Resets the round i.e distributes the cards to attacking players, based on bool taking,
        // distribute bout cards to defending player or remove to discarded pile, and get next 
        // players that will play
        private void ResetRound()
        {
            // update the cards for all attacking players until the deck is empty
            for (int i = 0; i < allAttackingPlayers.Count && deck.cardsLeft != 0; i++)
            {
                deck.UpdatePlayersHand(GetPlayer(allAttackingPlayers[i]));
            }
            // set the initial attacking player
            attackingPlayer = allAttackingPlayers[0];

            bool prevDefenderTaking = GetPlayer(defendingPlayer).IsPlayerTaking();
            if (prevDefenderTaking)
            {

                // add all the cards from the bout to the defending player
                GetPlayer(defendingPlayer).AddCardsToHand(bout.GetEverything());
                GetPlayer(defendingPlayer).SetIsTaking(false);
                GetNextPlayingPlayer(2, prevDefenderTaking);
            }
            else
            {
                // refill the cards for defending player 
                if (deck.cardsLeft > 0)
                {
                    deck.UpdatePlayersHand(GetPlayer(defendingPlayer));
                }

                UpdateDiscardedPile();

                GetNextPlayingPlayer(1, prevDefenderTaking);
            }

            bout.RemoveCardsFromBout();
        }

        // In case defender takes the cards, if the number attacking cards size (including new one) 
        // - defending cards size is greater than defenders hand then it is an extra card
        // In case defender defends all the cards and attacker attacks do a simple check - if the 
        // defender still has cards left
        private bool CheckIfAttackingCardIsExtra()
        {
            Player defender = GetPlayer(defendingPlayer);
            int leftOver = bout.GetAttackingCardsSize() + 1 - bout.GetDefendingCardsSize();

            return leftOver > defender.GetNumberOfCards() && defender.IsPlayerTaking() ||
                   defender.GetNumberOfCards() == 0 && !defender.IsPlayerTaking();
        }

        // function that controls the flow of the game: assigns new attacking/defending players
        // based on the outcome of the bout. 
        private void ChangeBattle(bool took)
        {
            // If any card was played by attacking player and done button was pressed
            if (bout.IsBoutChanged())
            {
                totalUninterruptedDone = 1;
                bout.SetBoutChanged(false);
                // if defending player took the cards, decrement totalUninteruptedDone to
                // avoid completing the bout. Also, decrement allAttackingPlayersIndex to ask the
                // same player if there any cards to be added
                if (took)
                {
                    GetPlayer(defendingPlayer).SetIsTaking(true);
                    totalUninterruptedDone -= 1;
                    allAttackingPlayersIndex -= 1;
                }
            }
            // this statement takes care the situation if the player pressed done and added no cards
            else
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

                // if current attacker cannot add anything to the bout OR if 
                // no additional cards can fit to defender's hand, change the attackers
                if (!IsAttackPossible() || CheckIfAttackingCardIsExtra())
                {
                    ChangeBattle(false);
                }
            }
            GetPlayer(attackingPlayer).SetIsAttackersTurn(true);
        }

        // The game is over when there is only one playing player left
        private bool IsGameOver()
        {
            return GetSizeOfPlayingPlayers() == 1;
        }

        // Returns the last player with cards. If no players with cards found then 
        // this implies the case when attacker attacks and defender defends in one
        // bout. This suggest that defender is durak
        private Player GetLastPlayer()
        {
            foreach (Player p in players)
            {
                if (p.GetNumberOfCards() > 0)
                {
                    return p;
                }
            }
            return GetPlayer(defendingPlayer);
        }

        private void CheckEndGame()
        {
            if (IsGameOver())
            {
                Player lastPlayer = GetLastPlayer();

                lastPlayer.playerState = PlayerState.Durak;

                gameStatus = GameStatus.GameOver;
            }
        }

        private void RemovePlayersCards()
        {
            Player lastPlayer = GetLastPlayer();
            if (lastPlayer.GetNumberOfCards() > 0)
            {
                discardedHeapSize += lastPlayer.GetNumberOfCards();
                lastPlayer.RemoveAllCardsFromHand();
            }
        }

        private PassportCards GetNextEnumValue(PassportCards current)
        {
            PassportCards[] Arr = (PassportCards[])Enum.GetValues(current.GetType());
            int j = Array.IndexOf(Arr, current) + 1;
            return Arr[j];
        }

        private void UpdatePlayerPassport(Player p, bool update)
        {
            if (p.passport == PassportCards.Ace)
            {
                p.playerState = PlayerState.Winner;
                return;
            }
            if (update)
            {
                p.playerState = PlayerState.Ascended;
                p.passport = GetNextEnumValue(p.passport);
                return;
            }
            p.playerState = PlayerState.NotAscended;
        }

        private void CheckIfPlayerIsWinner(int playerIndex)
        {
            if (!IsGameOver() && GetPlayer(playerIndex).GetNumberOfCards() == 0)
            {
                Player p = GetPlayer(playerIndex);
                if (variation != Variation.Passport)
                {
                    p.playerState = PlayerState.Winner;
                    return;
                }
                if (bout.AllPassport(p.passport))
                {
                    UpdatePlayerPassport(p, true);
                    return;
                }
                UpdatePlayerPassport(p, false);
            }
        }


        // controls flow of the game when the attacking player presses DONE. 
        public void AttackerDone()
        {
            CheckIfPlayerIsWinner(attackingPlayer);
            CheckIfPlayerIsWinner(defendingPlayer);

            CheckEndGame();

            if (gameStatus == GameStatus.GameInProcess)
            {
                ChangeBattle(false);
            }
            else if (gameStatus == GameStatus.GameOver)
            {
                // the game is over, durak is found and cards in the middle move to the
                // discarded pile 
                UpdateDiscardedPile();
                bout.RemoveCardsFromBout();

                // at the end remove the losers cards to discarded heap
                RemovePlayersCards();
            }
        }

        // controls the flow of the game when the defending player takes the cards
        public void DefenderTake()
        {
            CheckIfPlayerIsWinner(attackingPlayer);

            CheckEndGame();

            if (gameStatus == GameStatus.GameInProcess)
            {
                ChangeBattle(true);
            }
            else if (gameStatus == GameStatus.GameOver)
            {
                // the game is over, durak is found and the cards in the middle move the defender
                // because he/she took them

                // add all the cards from the bout to the defending player
                GetPlayer(defendingPlayer).AddCardsToHand(bout.GetEverything());
                bout.RemoveCardsFromBout();

                // at the end remove the losers cards to discarded heap
                RemovePlayersCards();
            }
        }

        private bool isPassportVariation()
        {
            return Variation.Passport == variation;
        }

        private bool isCardPassport(Card card, bool attacking)
        {
            Player player = attacking ? GetPlayer(attackingPlayer) : GetPlayer(defendingPlayer);

            int passportNumber = (int)player.passport;
            int cardNumber = (int)card.rank;

            return passportNumber == cardNumber;
        }

        public MoveResult DefenderMove(int cardIndex)
        {
            Player defPlayer = GetPlayer(defendingPlayer);
            if (!defPlayer.IsPlayerTaking())
            {
                // wait for the attack
                if (GetPlayer(attackingPlayer).IsAttackersTurn())
                {
                    return MoveResult.OutOfTurn;
                }

                int attackCardIndex = bout.GetAttackingCardsSize() - 1;

                Card attackingCard = bout.GetAttackingCard(attackCardIndex);
                Card defendingCard = defPlayer.GetPlayersCard(cardIndex);

                if (!IsLegalDefense(attackingCard, defendingCard))
                {
                    return MoveResult.IllegalMove;
                }
                if (defPlayer.IsPassport(defendingCard) && !IsTrumpSuit(defendingCard))
                {
                    return MoveResult.PassportViolation;
                }

                bout.AddDefendingCard(defendingCard);
                defPlayer.RemoveCardFromHand(defendingCard);

                // set defense finished to true
                GetPlayer(attackingPlayer).SetIsAttackersTurn(true);

                return MoveResult.OK;
            }
            return MoveResult.TookCards;
        }

        public MoveResult AttackerMove(int cardIndex)
        {
            Player player = GetPlayer(attackingPlayer);
            if (IsGameOver())
            {
                return MoveResult.GameIsOver;
            }
            // if the attack started wait for the defense
            if (!player.IsAttackersTurn())
            {
                return MoveResult.OutOfTurn;
            }

            Card attackingCard = player.GetPlayersCard(cardIndex);

            if (bout.GetAttackingCardsSize() == 0 || bout.ContainsRank(attackingCard.rank))
            {
                if (CheckIfAttackingCardIsExtra())
                {
                    return MoveResult.ExtraCard;
                }

                if (isPassportVariation())
                {
                    if (isCardPassport(attackingCard, true))
                    {
                        if (!GetPlayer(attackingPlayer).CheckIfAllCardsPassport())
                            // cannot attack with passport when there are other nonpassport cards
                            return MoveResult.PassportViolation;
                        return MoveResult.UseDisplayButton;
                    }
                }

                bout.AddAttackingCard(attackingCard);
                player.RemoveCardFromHand(attackingCard);

                bout.SetBoutChanged(true);

                if (!GetPlayer(defendingPlayer).IsPlayerTaking())
                {
                    player.SetIsAttackersTurn(false);
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
            if (!GetPlayer(defendingPlayer).IsPlayerTaking())
            {
                return bout.GetAttackingCardsSize() > bout.GetDefendingCardsSize() &&
                    !bout.AllPassport(GetPlayer(attackingPlayer).passport);
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

        public void DisplayPassports()
        {
            Card card;
            Player player = GetPlayer(attackingPlayer);

            int subtractor = 0;
            int size = player.GetNumberOfCards();
            for (int i = 0; i < size; i++)
            {
                card = player.GetPlayersCard(i - subtractor);
                bout.AddAttackingCard(card);
                player.RemoveCardFromHand(card);
                subtractor++;
            }

            bout.SetBoutChanged(true);
            // CheckIfPlayerIsWinner(attackingPlayer);
        }
    }
}


// Winner should be given once the DONE/TAKE button pressed
// Consider removing "Winner" enum from passport cards 