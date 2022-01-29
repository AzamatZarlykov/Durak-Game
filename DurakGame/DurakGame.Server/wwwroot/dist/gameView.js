import { Button } from './button.js';
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["NotCreated"] = 0] = "NotCreated";
    GameStatus[GameStatus["GameInProgress"] = 1] = "GameInProgress";
    GameStatus[GameStatus["GameOver"] = 2] = "GameOver";
})(GameStatus || (GameStatus = {}));
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Playing"] = 0] = "Playing";
    PlayerState[PlayerState["NotAscended"] = 1] = "NotAscended";
    PlayerState[PlayerState["Ascended"] = 2] = "Ascended";
    PlayerState[PlayerState["Winner"] = 3] = "Winner";
    PlayerState[PlayerState["Durak"] = 4] = "Durak";
})(PlayerState || (PlayerState = {}));
var Rank;
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
var Suit;
(function (Suit) {
    Suit[Suit["Club"] = 0] = "Club";
    Suit[Suit["Diamonds"] = 1] = "Diamonds";
    Suit[Suit["Heart"] = 2] = "Heart";
    Suit[Suit["Spade"] = 3] = "Spade";
})(Suit || (Suit = {}));
var PassportCards;
(function (PassportCards) {
    PassportCards[PassportCards["Six"] = 6] = "Six";
    PassportCards[PassportCards["Ten"] = 10] = "Ten";
    PassportCards[PassportCards["Jack"] = 11] = "Jack";
    PassportCards[PassportCards["Queen"] = 12] = "Queen";
    PassportCards[PassportCards["King"] = 13] = "King";
    PassportCards[PassportCards["Ace"] = 14] = "Ace";
})(PassportCards || (PassportCards = {}));
var Variation;
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
class MousePos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class GameView {
    constructor(socket) {
        this.mouseClickMargin = 7;
        this.cardDir = "images/deck/";
        this.modesDir = "images/modes/";
        this.iconsDir = "images/icons/";
        this.backCard = "2B";
        this.images = new Map();
        this.boutCardPositions = new Map();
        this.modesPositions = new Map();
        this.discardedPilePositions = new Map();
        this.iconsPositions = new Map();
        this.userName = "";
        this.fontSize = 20;
        this.hasInput = false;
        // setting is the first mode of each row
        this.selectedModes = [0, 0, 0];
        this.availableIcons = [true, true, true, true, true, true];
        this.state = State.Menu;
        this.socket = socket;
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        this.windowObjectsResize(canvas, context);
        this.mousePos = new MousePos(0, 0);
        this.setBoutPositions();
        this.setModesPositions();
        this.setIconsPositions();
        this.canvas.addEventListener("click", (e) => {
            this.mousePos.x = e.x;
            this.mousePos.y = e.y;
            console.log("The mouse click at : " + this.mousePos.x + " " + this.mousePos.y);
            this.CheckMouseClick();
        });
        window.addEventListener("resize", () => this.reportWindowResize(this.canvas, this.context));
    }
    getAvailableIcon() {
        for (let i = 0; i < this.availableIcons.length; i++) {
            if (this.availableIcons[i]) {
                return i;
            }
        }
    }
    setTotalPlayers(players) {
        this.totalPlayers = players;
    }
    storePreviousBoutState() {
        console.log("Defender: " + this.gameView.defendingPlayer);
        this.prevDefender = this.playerUserNames[this.gameView.defendingPlayer];
        this.attackCardsSize = this.gameView.attackingCards.length;
    }
    setTotalPlayersPlaying(players) {
        this.totalPlayersPlaying = players;
    }
    updateGameView(gameView) {
        this.gameView = gameView;
    }
    updatePlayingStatus(pl) {
        this.isPlaying = pl;
    }
    updateReadyPlayers(rp) {
        this.readyPlayers = rp;
    }
    updateAvailableIcons(availableIcons) {
        this.availableIcons = availableIcons;
        this.selectedIcon = this.getAvailableIcon();
    }
    setUserNames(names) {
        this.playerUserNames = names;
    }
    setTakenIcons(icons) {
        this.takenIcons = icons;
    }
    setID(id) {
        this.id = id;
    }
    setCreator(isCreator) {
        this.isCreator = isCreator;
    }
    setBoutPositions() {
        this.boutCardPositions.set(1, [{
                x: this.cardMiddleX - this.cardWidth / 2,
                y: this.deckPosY
            }]);
        this.boutCardPositions.set(2, [
            { x: this.cardMiddleX - this.cardWidth - this.cardWidth / 2, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth - this.cardWidth / 2, y: this.deckPosY }
        ]);
        this.boutCardPositions.set(3, [
            {
                x: this.cardMiddleX - 2 * this.cardWidth - this.cardWidth / 2,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX - this.cardWidth / 2,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX + this.cardWidth + this.cardWidth / 2,
                y: this.deckPosY
            }
        ]);
        this.boutCardPositions.set(4, [
            { x: this.cardMiddleX - 3 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX - this.cardWidth - this.cardWidth / 2, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth / 2, y: this.deckPosY },
            { x: this.cardMiddleX + 2 * this.cardWidth, y: this.deckPosY }
        ]);
    }
    setModesPositions() {
        this.modesPositions.set(1, {
            x: this.canvas.width / 2 - this.modeHeight / 2 - this.modeHeight,
            y: this.canvas.height / 2 - this.modeHeight - this.modeHeight / 2
        });
        this.modesPositions.set(2, {
            x: this.canvas.width / 2 + this.modeHeight / 2,
            y: this.canvas.height / 2 - this.modeHeight - this.modeHeight / 2
        });
        this.modesPositions.set(3, {
            x: this.canvas.width / 2 - this.modeHeight / 2,
            y: this.canvas.height / 2 + this.modeHeight / 4 - this.modeHeight / 2
        });
        this.modesPositions.set(4, {
            x: this.canvas.width / 2 - this.modeHeight / 2 - this.modeHeight - this.modeHeight,
            y: this.canvas.height / 2 + this.modeHeight / 2 + this.modeHeight - this.modeHeight / 2
        });
        this.modesPositions.set(5, {
            x: this.canvas.width / 2 - this.modeHeight / 2,
            y: this.canvas.height / 2 + this.modeHeight / 2 + this.modeHeight - this.modeHeight / 2
        });
        this.modesPositions.set(6, {
            x: this.canvas.width / 2 + this.modeHeight / 2 + this.modeHeight,
            y: this.canvas.height / 2 + this.modeHeight / 2 + this.modeHeight - this.modeHeight / 2
        });
    }
    setIconsPositions() {
        let startPos = this.canvas.width / 2 - (this.cardWidth * 6 + 5 *
            (this.canvas.width * 15 / 100 - this.cardWidth)) / 2;
        for (let i = 0; i < 6; i++) {
            this.iconsPositions.set(i, {
                x: startPos + (i * 15) / 100 * this.canvas.width,
                y: this.canvas.height / 2 + (10 / 100) * this.canvas.height
            });
        }
    }
    reportWindowResize(canvas, context) {
        this.windowObjectsResize(canvas, context);
        switch (this.state) {
            case State.Menu:
                this.displayMenu();
                break;
            case State.CreateGame:
                this.loadGameSettingMenu();
                break;
            case State.GameTable:
                this.displayStateOfTheGame();
                break;
            case State.PlayerSetup:
                this.loadPlayerSetupPage();
                break;
            case State.WaitingRoom:
                this.loadWaitingRoomPage();
                break;
        }
    }
    setFontSize(size) {
        if (typeof size !== undefined) {
            switch (this.state) {
                case State.Menu:
                    this.fontSize = 50;
                    break;
                case State.GameTable:
                    this.fontSize = 21;
                    break;
                case State.CreateGame:
                    this.fontSize = 45;
                    break;
                case State.PlayerSetup:
                    this.fontSize = 45;
                    break;
                case State.WaitingRoom:
                    this.fontSize = 50;
                    break;
            }
        }
        else {
            this.fontSize = size;
        }
        this.context.font = "bold " + this.fontSize + "px Serif";
        this.boxHeight = this.fontSize + this.textUpperMargin;
    }
    windowObjectsResize(canvas, context) {
        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;
        this.canvas = canvas;
        this.context = context;
        this.context.lineWidth = 3;
        this.textUpperMargin = 20;
        this.textLeftMargin = this.canvas.width / 251;
        this.setFontSize();
        this.cardWidth = 117;
        this.cardHeight = 140;
        this.modeHeight = this.canvas.height / 7;
        this.cardCorner = this.cardWidth / 4;
        this.cardMiddleX = this.canvas.width / 2;
        this.cardLeftX = this.canvas.width / 7;
        this.cardRightX = this.canvas.width / 7 * 6;
        this.cardUpperY = 5 / 100 * this.canvas.height + 35;
        this.cardLowerY = this.canvas.height - 25 / 100 * this.canvas.height;
        this.deckPosX = this.canvas.width / 11 * 0.5 - 25;
        this.deckPosY = this.canvas.height / 2 - 90;
        this.offset = this.cardHeight + 35;
        this.selectedIcon = this.getAvailableIcon();
        this.positionsAroundTable = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ];
        this.positionsAroundTableDuplicate = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ];
        this.setBoutPositions();
        this.setModesPositions();
        this.setIconsPositions();
    }
    myTurn() {
        return this.gameView.playerTurn == this.id;
    }
    isDefending() {
        return this.gameView.defendingPlayer == this.id;
    }
    isAttacking() {
        return this.gameView.attackingPlayer == this.id;
    }
    drawBox(text, x, y, strokeStyle, textStyle, withRectangle, fontS) {
        this.context.font = "bold " + fontS + "px serif";
        this.context.fillStyle = textStyle;
        this.context.strokeStyle = strokeStyle;
        if (withRectangle) {
            let textM = this.context.measureText(text);
            x = x - textM.width / 2;
            this.context.fillText(text, x, y);
            this.context.strokeRect(x - this.textLeftMargin, y - fontS, textM.width + 2 * this.textLeftMargin, this.textUpperMargin + fontS);
        }
        else {
            this.nTextMetrics = this.context.measureText(text);
            this.context.fillText(text, x - this.nTextMetrics.width / 2, y);
        }
    }
    /*
        Returns the index of the selected card position
    */
    GetCardSelected() {
        let x = this.positionsAroundTable[0].x;
        return (this.mousePos.x - x - this.mouseClickMargin) / this.cardCorner;
    }
    /*
        Check if the mouse click is within the main players hand
    */
    isCardSelected() {
        let x = this.positionsAroundTable[0].x;
        let y = this.positionsAroundTable[0].y;
        let w = this.positionsAroundTable[0].tWidth;
        return x + this.mouseClickMargin < this.mousePos.x &&
            this.mousePos.x <= x + w + this.mouseClickMargin &&
            y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
    }
    isButtonSelected() {
        return this.button.contains(this.mousePos);
    }
    isJoinPressed() {
        return this.joinButton.contains(this.mousePos);
    }
    isCreatePressed() {
        return this.createButton.contains(this.mousePos);
    }
    isBackToMenuPressed() {
        return this.buttonMenu.contains(this.mousePos);
    }
    /*
        Checks if given mode pressed
    */
    isSettingPressed(pos, size) {
        return pos.x < this.mousePos.x && this.mousePos.x <= pos.x + size &&
            pos.y < this.mousePos.y && this.mousePos.y <= pos.y + size;
    }
    /*
        Returns an image for a given card.
    */
    getImage(card, isCard, name) {
        let strImg;
        if (isCard) {
            if (card) {
                let strRank = this.fromIntToRank(card.rank);
                let strSuit = this.fromIntToSuit(card.suit);
                strImg = strRank.concat(strSuit);
            }
            else {
                strImg = this.backCard;
            }
        }
        else {
            strImg = name;
        }
        if (this.images.has(strImg)) {
            return this.images.get(strImg);
        }
        else {
            let img = new Image();
            img.onload = () => {
                // during the card game 
                if (isCard) {
                    this.displayStateOfTheGame();
                }
                // for game settings (modes)
                else if (name[0] != "i") {
                    this.loadGameSettingMenu();
                }
                // for player setup page
                else {
                    this.loadPlayerSetupPage();
                }
            };
            img.src = (isCard ? this.cardDir : (name[0] != "i" ? this.modesDir : this.iconsDir))
                .concat(strImg.concat(".png"));
            this.images.set(strImg, img);
            return img;
        }
    }
    drawX(x, y) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + this.cardWidth, y + this.cardWidth);
        this.context.moveTo(x, y + this.cardWidth);
        this.context.lineTo(x + this.cardWidth, y);
        this.context.stroke();
    }
    displaySettingImages() {
        let img;
        let pos;
        for (let i = 0; i < 6; i++) {
            pos = this.state == State.CreateGame ? this.modesPositions.get(i + 1) :
                this.iconsPositions.get(i);
            img = this.getImage(undefined, false, this.state == State.CreateGame ? (i + 1).toString()
                : "icon" + i.toString());
            this.context.drawImage(img, pos.x, pos.y, this.state == State.CreateGame ?
                this.cardHeight : this.cardWidth, this.state == State.CreateGame ?
                this.cardHeight : this.cardWidth);
            if (this.state == State.PlayerSetup && !this.availableIcons[i]) {
                this.drawX(pos.x, pos.y);
            }
        }
    }
    /*
        Outlines the modes based on the modes selected
    */
    outlineSelectedModes() {
        let modeOfTheRow;
        let pos;
        this.context.save();
        this.context.strokeStyle = 'lime';
        for (let i = 0; i < this.selectedModes.length; i++) {
            modeOfTheRow = this.selectedModes[i] + 1;
            if (i == 1) {
                modeOfTheRow += 2;
            }
            else if (i == 2) {
                modeOfTheRow += 3;
            }
            pos = this.modesPositions.get(modeOfTheRow);
            this.context.strokeRect(pos.x, pos.y, this.cardHeight, this.cardHeight);
        }
        this.context.restore();
    }
    /*
        Displays the main text in the middle of the screen. Also underlines the text
    */
    writeTextWithUnderlying(text, x, y, color) {
        let textM = this.context.measureText(text);
        // write text
        this.drawBox(text, x, y, color, color, false, this.fontSize);
        // make a line under Text
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(x - textM.width / 2 -
            textM.width % 10, y + this.fontSize / 2);
        this.context.lineTo(x + textM.width / 2 +
            textM.width % 10, y + this.fontSize / 2);
        this.context.stroke();
        this.context.restore();
    }
    /*
        Creates buttons that allow to get back to menu or move to the next stage of the game
    */
    renderKeyButtons(nextStateButton) {
        // create a back to Menu button
        this.buttonMenu = new Button(this, 50 + 2 * this.textLeftMargin, 50, "Menu", 30);
        this.buttonMenu.draw('black', 'black');
        // create a Proceed button
        let tM = this.context.measureText(nextStateButton);
        this.button = new Button(this, this.canvas.width - tM.width / 2 - 4 * this.textLeftMargin, this.canvas.height - this.boxHeight, nextStateButton, 30);
        this.button.draw('black', 'black');
    }
    /*
        Loads the Setting Menu screen with all the game modes
    */
    loadGameSettingMenu() {
        // redraw the screen
        this.drawScreen('lavender', 'black');
        // display "Choose Modes" text
        this.writeTextWithUnderlying("Choose Modes", this.canvas.width / 2, this.deckPosY - this.canvas.height / 4, "black");
        // display the setting of the game
        this.displaySettingImages();
        this.renderKeyButtons("Proceed");
        // Create outline of modes selected on each row
        this.outlineSelectedModes();
    }
    /*
        Checks if any of the mode was pressed
    */
    anyModePressed() {
        for (let i = 1; i <= 6; i++) {
            if (this.isSettingPressed(this.modesPositions.get(i), this.cardHeight)) {
                if (i == 1 || i == 2) {
                    this.selectedModes[0] = i - 1;
                }
                else if (3 < i && i < 7) {
                    i -= 4;
                    this.selectedModes[2] = i;
                }
                return true;
            }
        }
        return false;
    }
    removeInputBox() {
        document.body.removeChild(this.input);
        this.hasInput = false;
    }
    /*
        sets the properties of input element
    */
    setupInputElement(x, y) {
        this.input = document.createElement('input');
        this.input.value = this.userName;
        this.input.type = 'text';
        this.input.style.position = 'fixed';
        this.input.style.left = x + 'px';
        this.input.style.top = y + 'px';
        this.input.required;
        this.input.maxLength = 15;
        this.input.style.width = 180 + 'px';
        this.input.style.height = 33 + 'px';
        this.input.style.fontSize = 22 + 'px';
        this.input.style.fontFamily = 'Serif';
        this.hasInput = true;
        document.body.appendChild(this.input);
        this.input.focus();
    }
    //Function to dynamically add an this.this.input box: 
    addInput(x, y) {
        if (this.hasInput) {
            this.removeInputBox();
        }
        this.setupInputElement(x, y);
    }
    /*
        Outlines the selected icon in the player setup page
    */
    outlineSelectedIcon() {
        let pos = this.iconsPositions.get(this.selectedIcon);
        this.context.save();
        this.context.strokeStyle = 'lime';
        this.context.strokeRect(pos.x, pos.y, this.cardWidth, this.cardWidth);
        this.context.restore();
    }
    /*
        Displays the setup page where the user can select icon and write the name
    */
    loadPlayerSetupPage() {
        let textMetric;
        // redraw the screen
        this.drawScreen('lavender', 'black');
        // render the buttons
        this.renderKeyButtons("Create");
        // display the main text "Player Setup"
        this.writeTextWithUnderlying("Player Setup", this.canvas.width / 2, this.deckPosY - this.canvas.height / 4, "black");
        this.context.save();
        this.context.fillStyle = 'black';
        this.context.strokeStyle = 'black';
        // display form for name this.input
        textMetric = this.context.measureText("Name: ");
        this.context.fillText("Name: ", this.canvas.width / 2 - 2 * textMetric.width, this.canvas.height / 2 - this.canvas.height / 6);
        // add input element
        this.addInput(this.canvas.width / 2, this.canvas.height / 2 - this.canvas.height / 5);
        // create the options for icon selections
        textMetric = this.context.measureText("Select an Icon:");
        this.context.fillText("Select an Icon:", this.canvas.width / 2 - textMetric.width / 2, this.canvas.height / 2);
        this.context.restore();
        // display the setting of the game
        this.displaySettingImages();
        // outline selected Icon
        this.outlineSelectedIcon();
    }
    /*
        function loads the waiting room
    */
    loadWaitingRoomPage() {
        if (this.hasInput) {
            this.removeInputBox();
        }
        this.drawScreen('lavender', 'black');
        // display "Players: {number}" 
        this.drawBox("Players: " + this.totalPlayersPlaying, 25 / 100 * this.canvas.width, this.deckPosY, 'black', 'black', false, this.fontSize);
        // display "Ready: {number}" 
        this.drawBox("Ready: " + this.readyPlayers, 75 / 100 * this.canvas.width, this.deckPosY, 'black', 'black', false, this.fontSize);
        // create a Proceed button
        if (this.isCreator && this.totalPlayersPlaying == this.readyPlayers) {
            this.button = new Button(this, this.canvas.width / 2, this.canvas.height / 2 + this.boxHeight, "Start Game", this.fontSize);
            this.button.draw('black', 'black');
        }
    }
    switchPages(state, refresh) {
        this.state = state;
        switch (this.state) {
            case State.WaitingRoom:
                this.loadWaitingRoomPage();
                break;
            case State.GameTable:
                this.displayStateOfTheGame();
                break;
            case State.CreateGame:
                this.loadGameSettingMenu();
                break;
            case State.PlayerSetup:
                this.loadPlayerSetupPage();
                break;
        }
        this.setFontSize();
        if (refresh) {
            this.selectedModes = [0, 0, 0];
        }
    }
    /*
        Resets the user name, the icon selected and removes already created input element
    */
    resetSetupPageSettings() {
        this.removeInputBox();
        this.userName = "";
        this.selectedIcon = this.getAvailableIcon();
    }
    /*
        Checks Menu and Next(proceed/create) buttons and performs appropriate instructions
    */
    checkKeyButtonPress() {
        let strJSON;
        if (this.isBackToMenuPressed()) {
            if (this.state == State.PlayerSetup) {
                this.resetSetupPageSettings();
            }
            this.switchPages(State.Menu, false);
            this.displayMenu();
        }
        else if (this.isButtonSelected()) {
            if (this.state == State.PlayerSetup) {
                if (this.userName.length == 0) {
                    alert("Write the user name");
                    return;
                }
                // send info about icon and name selection
                strJSON = JSON.stringify({
                    From: this.id,
                    Message: "PlayerSetup",
                    Name: this.userName,
                    Icon: this.selectedIcon
                });
                this.socket.send(strJSON);
            }
            else if (this.state == State.CreateGame) {
                // send information about the game settings 
                strJSON = JSON.stringify({
                    Message: "GameSetup",
                    GameSetting: this.selectedModes
                });
                this.socket.send(strJSON);
                this.switchPages(State.PlayerSetup, true);
            }
        }
    }
    anyIconPressed() {
        for (let i = 0; i < 6; i++) {
            if (this.isSettingPressed(this.iconsPositions.get(i), this.cardWidth)) {
                if (this.availableIcons[i]) {
                    this.selectedIcon = i;
                    return true;
                }
            }
        }
        return false;
    }
    /*
       helper function that handles different circumstances of when pressing Join button
    */
    handleJoinButtonInstructions() {
        // if game is not being created then players cant join
        if (this.gameStatus == GameStatus.NotCreated) {
            this.displayMessage("GameNotCreated", true, 'red', 'red', this.canvas.width / 2, this.deckPosY +
                this.boxHeight + 25 * this.canvas.height / 100);
        }
        else if (this.gameStatus == GameStatus.GameInProgress && this.isPlaying) {
            this.switchPages(State.PlayerSetup, true);
        }
        else if (!this.isPlaying) {
            this.displayMessage("CannotJoin", true, 'red', 'red', this.canvas.width / 2, this.deckPosY +
                this.boxHeight + 25 * this.canvas.height / 100);
        }
    }
    /*
        helper function that handles different circumstances when pressing Create button
    */
    handleCreateButtonInstructions() {
        let strJSON;
        if (this.totalPlayers < 2) {
            this.displayMessage("LackOfPlayers", true, 'red', 'red', this.canvas.width / 2, this.deckPosY +
                this.boxHeight + 25 * this.canvas.height / 100);
        }
        else if (this.gameStatus == GameStatus.NotCreated) {
            strJSON = JSON.stringify({
                From: this.id,
                Message: "CreateGame"
            });
            this.socket.send(strJSON);
            this.switchPages(State.CreateGame, false);
        }
        else if (this.isPlaying) {
            // display that game is being created
            this.displayMessage("GameIsBeingCreated", true, 'red', 'red', this.canvas.width / 2, this.deckPosY +
                this.boxHeight + 25 * this.canvas.height / 100);
        }
        else if (!this.isPlaying) {
            // display that game has already started
            this.displayMessage("GameInProcess", true, 'red', 'red', this.canvas.width / 2, this.deckPosY +
                this.boxHeight + 25 * this.canvas.height / 100);
        }
    }
    handleWaitingRoomInstructions() {
        let strJSON;
        if (this.isButtonSelected()) {
            strJSON = JSON.stringify({
                Message: "StartGame"
            });
            this.socket.send(strJSON);
        }
    }
    backToLobby() {
        this.switchPages(State.Menu, false);
        this.displayMenu();
        this.gameStatus = GameStatus.NotCreated;
        this.availableIcons = [true, true, true, true, true, true];
        this.userName = "";
        this.id = undefined;
        this.selectedIcon = 0;
        this.totalPlayers--; // call to function when one player disconnects
    }
    /*
        When the game is over, if the creator presses the back to lobby button
        this function will send the commands to server
    */
    handleEndGameInstructions() {
        let strJSON;
        if (this.buttonMenu.getName() == "Back To Lobby") {
            strJSON = JSON.stringify({
                Message: "ResetGame"
            });
        }
        else {
            strJSON = JSON.stringify({
                Message: "NextRound"
            });
        }
        this.socket.send(strJSON);
    }
    /*
     helper function that handles different circumstances of when cards are clicked
     during the game.
 */
    handleCardClickInstructions() {
        let strJSON;
        if (this.isCardSelected()) {
            let cardIndex = Math.floor(this.GetCardSelected());
            if (cardIndex >= this.gameView.hand.length) {
                cardIndex = this.gameView.hand.length - 1;
            }
            strJSON = JSON.stringify({
                Message: this.isAttacking() ? "Attacking" : "Defending",
                Card: cardIndex
            });
        }
        // Done or Display Passport buttons
        else if (this.isButtonSelected()) {
            // Send "Display passport" message
            if (this.button.getName() == "Show Passport") {
                strJSON = JSON.stringify({
                    Message: "Show Passport"
                });
            }
            // send Done/Take message
            else if (this.gameView.attackingCards.length > 0) {
                strJSON = JSON.stringify({
                    Message: this.isAttacking() ? "Done" : "Take"
                });
            }
        }
        else {
            return;
        }
        this.socket.send(strJSON);
    }
    /*
        Function that tells which card the attacking player has selected to attack
    */
    CheckMouseClick() {
        if (this.state == State.GameTable) {
            if (this.gameView.gameStatus == GameStatus.GameInProgress &&
                (this.isAttacking() || this.isDefending())) {
                this.handleCardClickInstructions();
            }
            else if (this.gameView.gameStatus == GameStatus.GameOver) {
                this.handleEndGameInstructions();
            }
        }
        else if (this.state == State.Menu) {
            if (this.isJoinPressed()) {
                this.handleJoinButtonInstructions();
            }
            else if (this.isCreatePressed()) {
                this.handleCreateButtonInstructions();
            }
            else {
            }
        }
        else if (this.state == State.CreateGame) {
            this.checkKeyButtonPress();
            if (this.anyModePressed()) {
                this.switchPages(State.CreateGame, false);
            }
        }
        else if (this.state == State.PlayerSetup) {
            this.userName = this.input.value;
            this.checkKeyButtonPress();
            if (this.anyIconPressed()) {
                this.switchPages(State.PlayerSetup, false);
            }
        }
        else if (this.state == State.WaitingRoom) {
            this.handleWaitingRoomInstructions();
        }
    }
    displayBoutHelper(pos, yOffset, from, toAttacking, toDefending) {
        for (let i = from; i < toAttacking; i++) {
            let img = this.getImage(this.gameView.attackingCards[i], true);
            this.context.drawImage(img, pos[i % 4].x, pos[i % 4].y - yOffset, this.cardWidth, this.cardHeight);
        }
        for (let i = from; i < toDefending; i++) {
            if (i > this.gameView.defendingCards.length - 1) {
                return;
            }
            let img = this.getImage(this.gameView.defendingCards[i], true);
            this.context.drawImage(img, pos[i % 4].x + 20, pos[i % 4].y - yOffset, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Display attacking and defending cards in the middle of the table
    */
    displayBout() {
        let pos;
        let attackingCardSize = this.gameView.attackingCards.length;
        let defendingCardSize = this.gameView.defendingCards.length;
        let count = Math.floor(attackingCardSize / 4);
        let from = -4;
        let toAttacking = 0;
        let toDefending = 0;
        while (count > 0) {
            from = from + 4;
            toAttacking = toAttacking + 4;
            toDefending = toDefending + 4;
            pos = this.boutCardPositions.get(4);
            this.displayBoutHelper(pos, count * 30, from, toAttacking, toDefending);
            count = count - 1;
        }
        from = from + 4;
        toAttacking = toAttacking + attackingCardSize % 4;
        toDefending = toDefending + defendingCardSize % 4;
        pos = this.boutCardPositions.get(attackingCardSize % 4);
        this.displayBoutHelper(pos, 0, from, toAttacking, toDefending);
    }
    /*
        Display Discarded Heap
    */
    displayDiscardedHeap() {
        for (let i = 0; i < this.gameView.discardHeapSize; i++) {
            let coordinates;
            let img = this.getImage(undefined, true);
            this.context.save();
            this.context.translate(this.cardRightX + this.cardWidth, this.deckPosY + this.cardHeight / 2);
            // getting random angle and y position to replicate the real world discarded pile
            let angle = Math.random() * Math.PI * 2;
            let yPos = Math.random() * (this.deckPosY + 50 -
                this.deckPosY - 50) + this.deckPosY - 50;
            if (this.discardedPilePositions.get(i)) {
                coordinates = this.discardedPilePositions.get(i);
                this.context.rotate(coordinates.angle);
            }
            else {
                this.discardedPilePositions.set(i, { angle, yPos });
                this.context.rotate(angle);
            }
            this.context.translate(-this.cardRightX, -this.deckPosY - this.cardHeight / 2);
            this.context.drawImage(img, this.cardRightX, yPos, this.cardWidth, this.cardHeight);
            this.context.restore();
        }
    }
    /*
        Dispaly the Suit of the Trump card when there is no deck
    */
    displayTrumpSuit() {
        let img = this.getImage(this.gameView.trumpCard, true);
        this.context.drawImage(img, this.cardLeftX - this.cardWidth, this.deckPosY, this.cardWidth, this.cardHeight);
    }
    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck
    */
    displayDeck() {
        let img = this.getImage(this.gameView.trumpCard, true);
        this.context.save();
        this.context.translate(this.deckPosX + this.cardWidth + this.cardWidth / 2, this.deckPosY + this.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.deckPosX - this.cardWidth / 2, -this.deckPosY - this.cardHeight / 2 + 25);
        this.context.drawImage(img, this.deckPosX, this.deckPosY, this.cardWidth, this.cardHeight);
        this.context.restore();
        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.getImage(undefined, true);
            this.context.drawImage(img, this.deckPosX + i + this.cardWidth * 1 / 150, this.deckPosY, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Returns the string from number that represents the
        rank of the card
    */
    fromIntToRank(enumRank) {
        if (4 < enumRank && enumRank < 10) {
            return enumRank.toString();
        }
        return "TJQKA"[enumRank - 10];
    }
    /*
        Returns the string from number that represents the
        suit of the card
    */
    fromIntToSuit(enumSuit) {
        return "CDHS"[enumSuit];
    }
    getDurakIndex() {
        for (let i = 0; i < this.gameView.playersView.length; i++) {
            if (this.gameView.playersView[i].playerState == PlayerState.Durak) {
                return i;
            }
        }
    }
    /*
        Displays the player who lost
    */
    displayDurakMessage() {
        this.drawBox("Durak is " + this.playerUserNames[this.getDurakIndex()], this.canvas.width / 2, this.deckPosY + this.cardHeight / 2, 'white', 'white', true, this.fontSize);
    }
    /*
        displays the cards from the gameView object
    */
    displayMainPlayersHand(hand, x, y, tWidth) {
        for (let i = 0; i < hand.length; i++) {
            let img = this.getImage(hand[i], true);
            this.context.drawImage(img, x + i * this.cardCorner, y, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Displays the face down cards of opponents
    */
    displayFaceDownCards(playerView, x, y, tWidth) {
        for (let i = 0; i < playerView.numberOfCards; i++) {
            let img = this.getImage(undefined, true);
            this.context.drawImage(img, x + i * this.cardCorner, y, this.cardWidth, this.cardHeight);
        }
    }
    /*
        Draws an arrow to indicate which players turn it is to play a card
        source: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
    */
    drawArrow(fromX, fromY, toX, toY, style) {
        let headlen = 10; // length of head in pixels
        let dx = toX - fromX;
        let dy = toY - fromY;
        let angle = Math.atan2(dy, dx);
        this.context.save();
        this.context.strokeStyle = style;
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(fromX, fromY);
        this.context.lineTo(toX, toY);
        this.context.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen *
            Math.sin(angle - Math.PI / 6));
        this.context.moveTo(toX, toY);
        this.context.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen *
            Math.sin(angle + Math.PI / 6));
        this.context.stroke();
        this.context.restore();
    }
    GetBoxStyle(currentID) {
        if (this.gameView.gameStatus == GameStatus.GameOver) {
            return 'black';
        }
        if (currentID == this.gameView.attackingPlayer) {
            return 'lime';
        }
        else if (currentID == this.gameView.defendingPlayer) {
            return 'red';
        }
        return 'black';
    }
    displayPlayerIconInGame(indexOfIcon, pos) {
        let img;
        img = this.getImage(undefined, false, "icon" + this.takenIcons[indexOfIcon]);
        this.context.drawImage(img, pos.x + pos.tWidth / 2 - this.cardWidth / 4, pos.y + this.cardHeight - 75 / this.cardWidth * 100, 75 / this.cardWidth * 100, 75 / this.cardWidth * 100);
    }
    getPassportString(enumPassporty) {
        switch (enumPassporty) {
            case PassportCards.Six:
                return "6";
            case PassportCards.Ten:
                return "10";
            case PassportCards.Jack:
                return "J";
            case PassportCards.Queen:
                return "Q";
            case PassportCards.King:
                return "K";
            case PassportCards.Ace:
                return "A";
            default:
                console.log("Unknown Passport Index Given");
                break;
        }
    }
    PlayerWon(currentID) {
        return this.gameView.playersView[currentID].playerState == PlayerState.Winner;
    }
    PlayerAscended(currentID) {
        return this.gameView.playersView[currentID].playerState == PlayerState.Ascended;
    }
    displayPlayersSetup(currentID, pos) {
        let color = this.GetBoxStyle(currentID);
        // display the players user names 
        this.drawBox(this.playerUserNames[currentID], pos.x + pos.tWidth / 2, pos.y + this.offset, color, 'white', true, this.fontSize);
        // dispaly the players icons
        this.displayPlayerIconInGame(currentID, pos);
        // setup for passport variation
        if (this.gameView.variation == Variation.Passport) {
            if (this.PlayerWon(currentID)) {
                this.drawBox("Winner", pos.x + pos.tWidth / 2, pos.y + this.cardHeight / 4, 'white', 'white', true, this.fontSize);
            }
            else if (this.PlayerAscended(currentID)) {
                this.drawBox("Passport upgraded to " +
                    this.getPassportString(this.gameView.playersView[currentID].passport), pos.x + pos.tWidth / 2, pos.y + this.cardHeight / 4, 'white', 'white', true, this.fontSize);
            }
            if (!this.PlayerWon(currentID)) {
                // display the players passport
                this.writeTextWithUnderlying("Passport: " + this.getPassportString(this.gameView.playersView[currentID].passport), pos.x + pos.tWidth / 2, pos.y - 2 * this.fontSize, "white");
            }
        }
        // setup for classic variation
        else {
            // display winner
            if (this.PlayerWon(currentID)) {
                this.drawBox("Winner", pos.x + pos.tWidth / 2, pos.y + this.fontSize, 'white', 'white', true, this.fontSize);
            }
        }
    }
    /*
        returns true when the defending player should display Take and Defend
    */
    checkTakingCondition() {
        return this.gameView.attackingCards.length >
            this.gameView.defendingCards.length && !this.gameView.takingCards;
    }
    /*
         returns true if the bout contains only the passport of the attacking player
    */
    passportDisplayed() {
        let cards = this.gameView.attackingCards; // all attacking cards in bout
        let attackerPassport = this.gameView.playersView // passport 
        [this.gameView.attackingPlayer].passport;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].rank.valueOf() != attackerPassport.valueOf()) {
                return false;
            }
        }
        return true;
    }
    displayPlayerOptions(textStr, buttonStr, pos, noCards = true) {
        if (noCards) {
            this.drawBox(textStr, pos.x + pos.tWidth + this.cardWidth, pos.y + this.offset, 'white', 'white', false, this.fontSize);
        }
        this.button = new Button(this, pos.x + pos.tWidth + this.cardWidth +
            this.nTextMetrics.width + 8 * this.textLeftMargin, pos.y + this.offset, buttonStr, this.fontSize);
        this.button.draw('white', 'white');
    }
    manageAttackingPlayerGameSetup(pos) {
        if (this.gameView.gameStatus == GameStatus.GameOver) {
            return;
        }
        // just display button "Show Passport"
        if (this.gameView.playersView[this.id].allCardsPassport &&
            this.gameView.attackingCards.length == 0) {
            this.displayPlayerOptions(undefined, "Show Passport", pos, false);
            return;
        }
        // display "Attack" message if no cards were played 
        if (this.gameView.attackingCards.length == 0) {
            this.drawBox("Attack", pos.x + pos.tWidth + this.cardWidth, pos.y + this.offset, 'white', 'white', false, this.fontSize);
        }
        else if (this.gameView.attackingCards.length == this.gameView.defendingCards.length
            || this.gameView.takingCards) {
            // display message "Add Cards" if the player took cards
            if (this.gameView.takingCards) {
                this.displayPlayerOptions("Add Cards", "Done", pos, true);
            }
            // display message "Continue Attack" if the player defended successfully
            else {
                if (this.gameView.playersView[this.gameView.attackingPlayer].numberOfCards != 0) {
                    this.displayPlayerOptions("Continue Attack", "Done", pos, true);
                }
                else {
                    this.displayPlayerOptions(undefined, "Done", pos, false);
                }
            }
        }
        // display "Done" in case when player display all passports
        else if (this.gameView.variation == Variation.Passport && this.passportDisplayed()) {
            this.displayPlayerOptions(undefined, "Done", pos, false);
        }
    }
    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    displayPlayersHelper(currentID, index, position) {
        let pos = this.positionsAroundTable[position[index] - 1];
        // Add an arrow indicating whose turn it is to play
        if (currentID == this.gameView.playerTurn &&
            this.gameView.gameStatus != GameStatus.GameOver) {
            let arrowPos = this.positionsAroundTableDuplicate[position[index] - 1];
            this.drawArrow(arrowPos.x - 130, pos.y + this.offset, arrowPos.x - 70, pos.y +
                this.offset, 'white');
        }
        if (this.id == currentID) {
            this.displayMainPlayersHand(this.gameView.hand, pos.x, pos.y, pos.tWidth);
            if (this.isAttacking()) {
                this.manageAttackingPlayerGameSetup(pos);
            }
            // display "Take" button on the defending player if cannot defend / just want to
            if (this.isDefending() && this.checkTakingCondition()) {
                if (this.gameView.variation == Variation.Classic || !this.passportDisplayed()) {
                    this.displayPlayerOptions("Defend", "Take", pos, true);
                }
            }
        }
        else {
            this.displayFaceDownCards(this.gameView.playersView[currentID], pos.x, pos.y, pos.tWidth);
        }
        this.displayPlayersSetup(currentID, pos);
    }
    /*
        Returns the position of players depending on the
        size of players playing
    */
    getPositions(totalPlayers) {
        switch (totalPlayers) {
            case 2:
                return [1, 4];
            case 3:
                return [1, 3, 5];
            case 4:
                return [1, 3, 4, 5];
            case 5:
                return [1, 2, 3, 5, 6];
            case 6:
                return [1, 2, 3, 4, 5, 6];
        }
    }
    /*
        Displays Players arounds the table
    */
    displayPlayers() {
        this.context.fillStyle = 'white';
        let position = this.getPositions(this.gameView.playersView.length);
        let currentID;
        for (let i = 0; i < this.gameView.playersView.length; i++) {
            currentID = (this.id + i) % this.gameView.playersView.length;
            // calculate the total width of cards 
            this.totalCardWidth = (this.gameView.playersView[currentID].numberOfCards - 1) *
                this.cardCorner + this.cardWidth;
            // subtract from given x point in the window the half of the width of cards
            this.positionsAroundTable[position[i] - 1].x =
                this.positionsAroundTableDuplicate[position[i] - 1].x - this.totalCardWidth / 2;
            this.positionsAroundTable[position[i] - 1].tWidth = this.totalCardWidth;
            this.displayPlayersHelper(currentID, i, position);
        }
    }
    /*
        Stops displaying the table and the current number of
        players joined to the game
    */
    removeTable() {
        this.canvas.style.display = "none";
    }
    /*
        Displays the table and the current number of
        players joined to the game
    */
    drawScreen(fillS, strokeS) {
        // Draws the empty table
        this.context.save();
        this.context.fillStyle = fillS;
        this.context.strokeStyle = strokeS;
        this.context.lineWidth = 10;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
    }
    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    displayStateOfTheGame() {
        this.drawScreen('#2C974F', 'black');
        this.displayPlayers();
        if (this.gameView.deckSize == 0) {
            this.displayTrumpSuit();
        }
        else {
            this.displayDeck();
        }
        if (this.gameView.discardHeapSize != 0 && this.gameView.discardHeapChanged) {
            this.displayDiscardedHeap();
        }
        this.displayBout();
        if (this.gameView.gameStatus == GameStatus.GameOver) {
            if (this.gameView.variation != Variation.Passport ||
                this.gameView.passportGameOver) {
                this.displayDurakMessage();
            }
            // display "Back To Lobby" button for the creator. When pressed every player moves 
            // to the lobby
            if (this.isCreator) {
                if (this.gameView.variation == Variation.Passport &&
                    !this.gameView.passportGameOver) {
                    this.buttonMenu = new Button(this, this.canvas.width / 2, 60 / 100 * this.canvas.height, "Start Next Round", 45);
                    this.buttonMenu.draw('white', 'white');
                }
                else if (this.gameView.variation != Variation.Passport ||
                    this.gameView.passportGameOver) {
                    this.buttonMenu = new Button(this, this.canvas.width / 2, 60 / 100 * this.canvas.height, "Back To Lobby", 45);
                    this.buttonMenu.draw('white', 'white');
                }
            }
        }
    }
    /*
        Displays the menu section once the players connect
        Menu section has Join and Create Buttons
    */
    displayMenu() {
        if (this.hasInput) {
            this.removeInputBox();
        }
        this.drawScreen('Lavender', 'black');
        this.context.save();
        this.writeTextWithUnderlying("MENU", this.canvas.width / 2, this.deckPosY - this.canvas.height / 4, "black");
        // create buttons for JOIN and CREATE
        this.joinButton = new Button(this, this.canvas.width / 2, this.deckPosY - this.textUpperMargin, "JOIN", this.fontSize);
        this.joinButton.draw('black', 'black');
        this.createButton = new Button(this, this.canvas.width / 2, this.deckPosY + this.boxHeight, "CREATE", this.fontSize);
        this.createButton.draw('black', 'black');
        this.context.restore();
    }
    getSuitableErrorMessage(type) {
        switch (type) {
            case "illegal":
                return "Illegal Card Played";
            case "wait":
                return this.isAttacking() ? "Wait For The Defending Player" :
                    "Wait For The Attacking Player";
            case "tookCards":
                return "Cannot Defend. You Decided To Take The Cards";
            case "takeCards":
                return this.prevDefender + " takes the " +
                    (this.attackCardsSize == 1 ? "Card" : "Cards");
            case "extraCard":
                return `This card is extra. Cannot fit in defender's hand`;
            case "gameIsAlreadyOver":
                return "The game is already over";
            case "GameIsBeingCreated":
                return "The game is being created";
            case "LackOfPlayers":
                return "Not enough players to start the game";
            case "GameNotCreated":
                return "Game is not created yet";
            case "GameInProcess":
                return "Game is being played by other players";
            case "CannotJoin":
                return "Cannot Join. Game has already started";
            case "UserNameTaken":
                return "The user name is already taken. Try another one";
            case "passport":
                return "Passport Violation. Your Passport is " +
                    this.getPassportString(this.gameView.playersView[this.id].passport);
            case "displayPassport":
                return "To display passports, use Show Passport button";
            default:
                console.log("Unknown type of the string (Check the error types)");
                break;
        }
    }
    /*
        Display the error if Attack/Defense is illegal
    */
    displayMessage(type, settings, fillS, strokeS, x, y) {
        console.log("SHOW TAKE MESSAGE");
        this.context.save();
        this.context.fillStyle = fillS;
        this.context.strokeStyle = strokeS;
        let textStr = this.getSuitableErrorMessage(type);
        console.log(textStr);
        let xP;
        let yP;
        if (settings) {
            xP = x;
            yP = y;
        }
        else {
            xP = this.positionsAroundTable[0].x + this.positionsAroundTable[0].tWidth / 2;
            yP = this.gameView.attackingCards.length == 0 ?
                this.deckPosY - 2 * this.textUpperMargin :
                this.deckPosY + this.cardHeight + 2 * this.textUpperMargin;
        }
        this.drawBox(textStr, xP, yP, fillS, strokeS, true, this.fontSize);
        switch (this.state) {
            case State.GameTable:
                setTimeout(() => this.displayStateOfTheGame(), 3000);
                break;
            case State.Menu:
                setTimeout(() => this.displayMenu(), 3000);
                break;
        }
        this.context.restore();
    }
}
//# sourceMappingURL=gameView.js.map