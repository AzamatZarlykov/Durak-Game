export enum GameStatus {
    NotCreated, GameInProgress, GameOver
}

export enum PlayerState {
    Playing, NotAscended, Ascended, Winner, Durak
}

export enum Rank {
    Six = 6, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace
}

export enum Suit {
    Club, Diamonds, Heart, Spade
}

export enum PassportCards {
    Six = 6, Ten = 10, Jack = 11, Queen = 12, King = 13, Ace = 14
}

export enum Variation { Classic, Passport }

export enum State {
    Menu, CreateGame, PlayerSetup, WaitingRoom, GameTable
}


export interface PlayerView {
    numberOfCards: number;
    isAttacking: boolean;
    allCardsPassport: boolean;
    playerState: PlayerState;
    passport: PassportCards;
}

export interface Card {
    rank: Rank;
    suit: Suit;
}

export interface GameViewInfo {
    playerID: number;

    attackingPlayer: number;
    defendingPlayer: number;
    playerTurn: number;

    deckSize: number;
    discardHeapSize: number;
    discardHeapChanged: boolean;

    gameStatus: GameStatus;
    variation: Variation;

    hand: Card[];

    playersView: PlayerView[];
    trumpCard: Card;

    attackingCards: Card[];
    defendingCards: Card[];

    takingCards: boolean;
    passportGameOver: boolean;
}