namespace DurakGame.Library.GameCard
{
    /// <summary>
    /// Card class that represents the card in Durak
    /// </summary>
    public class Card
    {
        private readonly Suit suit;
        private readonly Rank rank;

        public Card() { }
        public Card(Suit _suit, Rank _rank)
        {
            suit = _suit;
            rank = _rank;
        }

        public Suit GetSuit() => suit;
        public Rank GetRank() => rank;
        public override string ToString()
        {
            return "Card has a rank " + rank + " and suit " + suit + "s";
        }
    }
}
