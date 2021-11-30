using System;
using System.Collections.Generic;

using DurakGame.Library.GameCard;

namespace DurakGame.Library.GamePlayer
{
    public enum WaitingRoomState { NotReady, Ready }
    public enum PlayerState { Playing, Winner, Durak }
    public class Player
    {
        private string name;
        private int icon;

        private bool isTaking;
        private bool isAttackersTurn;

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

        public void PrintCards()
        {
            foreach (Card c in playersHand)
            {
                Console.WriteLine("The rank : " + c.rank + ". The suit : " + c.suit);
            }
        }
    }
}
