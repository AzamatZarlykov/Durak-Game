using System.Collections.Generic;

using DurakGame.Model.Durak;
using DurakGame.Model.PlayingCards;
using DurakGame.Model.GamePlayer;

namespace DurakGame.GameStateView
{
    /// <summary>
    /// Object that contains information about each player during the game 
    /// used to carry on the information to display (information that each
    /// player knows/sees )
    /// </summary>
    public class PlayerView
    {
        public int numberOfCards;
        public bool isAttacking;
        public bool allCardsPassport;
        public PlayerState playerState;
        public PassportCards passport;
    }

    /// <summary>
    /// This class is used to be sent as an object from server to client
    /// to represent the state of the current playing game. 
    /// </summary>
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
}
