export var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["NotCreated"] = 0] = "NotCreated";
    GameStatus[GameStatus["GameInProgress"] = 1] = "GameInProgress";
    GameStatus[GameStatus["GameOver"] = 2] = "GameOver";
})(GameStatus || (GameStatus = {}));
export var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Playing"] = 0] = "Playing";
    PlayerState[PlayerState["NotAscended"] = 1] = "NotAscended";
    PlayerState[PlayerState["Ascended"] = 2] = "Ascended";
    PlayerState[PlayerState["Winner"] = 3] = "Winner";
    PlayerState[PlayerState["Durak"] = 4] = "Durak";
})(PlayerState || (PlayerState = {}));
export var Rank;
(function (Rank) {
    Rank[Rank["Six"] = 6] = "Six";
    Rank[Rank["Seven"] = 7] = "Seven";
    Rank[Rank["Eight"] = 8] = "Eight";
    Rank[Rank["Nine"] = 9] = "Nine";
    Rank[Rank["Ten"] = 10] = "Ten";
    Rank[Rank["Jack"] = 11] = "Jack";
    Rank[Rank["Queen"] = 12] = "Queen";
    Rank[Rank["King"] = 13] = "King";
    Rank[Rank["Ace"] = 14] = "Ace";
})(Rank || (Rank = {}));
export var Suit;
(function (Suit) {
    Suit[Suit["Club"] = 0] = "Club";
    Suit[Suit["Diamonds"] = 1] = "Diamonds";
    Suit[Suit["Heart"] = 2] = "Heart";
    Suit[Suit["Spade"] = 3] = "Spade";
})(Suit || (Suit = {}));
export var PassportCards;
(function (PassportCards) {
    PassportCards[PassportCards["Six"] = 6] = "Six";
    PassportCards[PassportCards["Ten"] = 10] = "Ten";
    PassportCards[PassportCards["Jack"] = 11] = "Jack";
    PassportCards[PassportCards["Queen"] = 12] = "Queen";
    PassportCards[PassportCards["King"] = 13] = "King";
    PassportCards[PassportCards["Ace"] = 14] = "Ace";
})(PassportCards || (PassportCards = {}));
export var Variation;
(function (Variation) {
    Variation[Variation["Classic"] = 0] = "Classic";
    Variation[Variation["Passport"] = 1] = "Passport";
})(Variation || (Variation = {}));
export var State;
(function (State) {
    State[State["Menu"] = 0] = "Menu";
    State[State["CreateGame"] = 1] = "CreateGame";
    State[State["PlayerSetup"] = 2] = "PlayerSetup";
    State[State["WaitingRoom"] = 3] = "WaitingRoom";
    State[State["GameTable"] = 4] = "GameTable";
})(State || (State = {}));
//# sourceMappingURL=helper.js.map