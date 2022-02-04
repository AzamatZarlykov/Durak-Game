using System;
using System.Collections.Generic;

using DurakGame.Model.PlayingCards;

using DurakGame.Model.Durak;
using DurakGame.Server.Middleware;

namespace DurakGame.Model.GamePlayer
{
    public enum PlayerState { Playing, NotAscended, Ascended, Winner, Durak }
    public class Player
    {
        private string name;
        private int icon;

        private bool isTaking;
        private bool isAttackersTurn;

        public PassportCards passport = PassportCards.Six;
        public WaitingRoomState waitingRoomState;
        public PlayerState playerState;

        private List<Card> playersHand = new List<Card>();

        public List<Card> GetPlayersHand() => playersHand;

        public bool IsPlayerTaking() => isTaking;
        public bool IsAttackersTurn() => isAttackersTurn;
        public int GetNumberOfCards() => playersHand.Count;
        public Card GetPlayersCard(int index) => playersHand[index];
        public string GetPlayersName() => name;
        public int GetPlayersIcon() => icon;
        public void SetPlayerName(string n)
        {
            name = n;
        }

        public void SetPlayerIcon(int i)
        {
            icon = i;
        }

        public void SetIsTaking(bool value)
        {
            isTaking = value;
        }
        public void SetIsAttackersTurn(bool value)
        {
            isAttackersTurn = value;
        }

        public void AddCardsToHand(List<Card> cards)
        {
            for (int i = 0; i < cards.Count; i++)
            {
                playersHand.Add(cards[i]);
            }
        }

        public void RemoveCardFromHand(Card card)
        {
            playersHand.Remove(card);
        }

        public void RemoveAllCardsFromHand()
        {
            playersHand.Clear();
        }

        // function that checks if the remaining cards of a player are passports
        public bool CheckIfAllCardsPassport()
        {
            int p = (int)passport;
            int r;

            foreach (Card card in playersHand)
            {
                r = (int)card.rank;
                if (r != p)
                {
                    return false;
                }
            }
            return true;
        }

        // return true if the card is player's passport
        public bool IsPassport(Card card)
        {
            return (int)card.rank == (int)passport;
        }

        public void Reset()
        {
            isTaking = false;
            isAttackersTurn = false;
            playerState = PlayerState.Playing;
        }
        public void PrintCards()
        {
            foreach (Card c in playersHand)
            {
                Console.WriteLine("The rank : " + c.rank + ". The suit : " + c.suit);
            }
        }

        public void PrintInfo(bool isAttacker)
        {
            Console.WriteLine("PRINTING PLAYER INFORMATION:");
            Console.WriteLine("NAME: " + name);
            Console.WriteLine("IS " + (isAttacker ? "ATTACKING: " : "TAKING: ") +
                (isAttacker ? isAttackersTurn : isTaking));
            Console.WriteLine("PLAYER STATE: " + playerState);
            Console.WriteLine("CARDS: ");
            PrintCards();
            Console.WriteLine();
        }
    }
}
