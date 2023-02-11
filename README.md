# Web-based Durak Game

This project is a web-based application designed to play the famous game Durak. Durak is a strategic card game that originated in Russia, and it typically involves two to six players. Unlike most other games, the aim of Durak is not to find a winner, but to find a loser. Players take turns attacking and defending in a series of rounds, with the goal of getting rid of all their cards, and the player left holding cards at the end is declared the fool.

## Gameplay

Here are some screenshots of the web-based implementation of Durak:

![Screenshot 1](/Documentation/img/Screenshot%202023-02-11%20191252.jpg)

This screenshot shows the main menu of the Durak game.

![Screenshot 2](/Documentation/img/create_modes.jpg)

This screenshot shows an example of setting the game modes as a creator of the game. Note: this can be access only by one player and when there are more than 1 player in the menu.

![Screenshot 3](/Documentation/img/player_setup.jpg)

This screenshot shows player setting up their profiles. The creator gets to this page when the game setup is finished. For the joining player(s), this gets moved immediately once the `'Join'` button pressed from the menu.

![Screenshot 4](/Documentation/img/waiting_room.jpg)

This screenshot shows waiting room for the players before starting the game. The creator waits until all the other players set up their profiles. Once the players are ready, the start the game button pops up for the creator of the game. By pressing it, the game starts.

![Screenshot 4](/Documentation/img/gameplay.jpg)
This screenshot shows the game in progress between two players. 

## Features

The web-based implementation of Durak includes the following features:

1. Multiplayer Support: The application allows for 2-6 players to participate in a single game of Durak, making it a great option for both casual and competitive play.

2. Variation Support: In addition to the traditional Durak game, the "Podkidnoy" and "Passport" variations are also supported, offering players a unique gaming experience.

3. Attack Modes: Players have the option to play a game where one side, two sides, or all sides can attack, offering a dynamic and challenging gaming experience.

4. User-friendly Design: The application has a user-friendly design that makes it easy to navigate and play the game, even for those who are new to Durak.

5. Smooth Gameplay: The game runs smoothly, ensuring a seamless and enjoyable gaming experience for all players involved.

## Technologies

* C# - This project is written in C# language, which is a popular and powerful language for developing web applications.
* .NET 6 SDK - The project uses the Microsoft.NET.Sdk.Web to develop the web-based application.
* TypeScript 4.3

Please make sure you have the above requirements and dependencies installed before running the code for this project.

## Setup

1. Clone the repository to your local machine using the following command: 

```bash
git clone https://github.com/AzamatZarlykov/Durak-Game.git
```
2. Navigate to the cloned repository, then to the `'/Durak-Web'` repository and run the following command:

```
dotnet run
```

3. Open your web browser and navigate to http://localhost:5000 to view and interact with the Durak Web application.

## License
This project is licensed under the MIT License. For more information, see the [LICENSE](LICENSE)  file.