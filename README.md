# Discord Inter-Server Chat Bot

This is a Discord bot that facilitates cross-server communication by relaying messages between designated channels on different Discord servers.

## Features

*   **Cross-Server Chat:** Relays messages between a specified channel on multiple Discord servers.
*   **Configurable Channel:**  Allows users to set the inter-server chat channel using a command. (**Important:** Each server admin must configure the channel on their server).
*   **MongoDB Persistence:**  Stores the channel ID and message history in MongoDB so the bot remembers the channel, server name, author and messages after a restart.
*   **Discord.js v14:** Uses the latest Discord.js library.

## Prerequisites

*   **Node.js:**  Version 16.6 or higher.
*   **npm:** (Node Package Manager) - usually comes with Node.js.
*   **Discord Bot Token:** You'll need to create a Discord bot and obtain its token from the [Discord Developer Portal](https://discord.com/developers/applications).
*   **MongoDB:**  A running MongoDB instance and connection string.

## Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/CodersPlanetHQ/Global-djs-v14-bot
    cd Global-djs-v14-bot
    ```

2.  **Install Dependencies:**

    ```bash
    npm install discord.js mongodb
    ```

3.  **Configuration:**

    *   Rename the `.env.example` file to `.env`.
    *   Edit the `.env` file and set the following environment variables:

        ```
        TOKEN=YOUR_BOT_TOKEN          # Your Discord bot token
        MONGODB_URI=YOUR_MONGODB_URI  # Your MongoDB connection string
        COMMAND_PREFIX=!              # The command prefix for bot commands (e.g., !)
        ```

   * Alternative configuration is directly setting the values on the js code instead of creating and setting on `.env` files.

4.  **Create the MongoDB Database:**

    *   Ensure that the database name used in the `MONGODB_URI` exists in your MongoDB instance. The default database name in the code is `interserver_bot`. Also, ensure the `config` collection are properly set up on your mongoDB.

5.  **Invite the Bot to Your Server(s):**

    *   Go to the [Discord Developer Portal](https://discord.com/developers/applications).
    *   Select your application, and navigate to the "OAuth2" -> "URL Generator" section.
    *   Select the `applications.commands` scope and the "Bot" scope.
    *   Give the bot the following permissions:
        *   Read Messages
        *   Send Messages
        *   Embed Links
    *   **Important:** Enable the following "Privileged Gateway Intents" in the "Bot" section of the Developer Portal:
        *   `Message Content Intent`
        *   `Server Members Intent` (required to see the members of servers)
    *   Copy the generated URL and use it to invite the bot to your Discord server(s).

## Running the Bot

1.  **Start the Bot:**

    ```bash
    node index.js
    ```

## Usage

1.  **Setting the Inter-Server Channel:**

    *   On *each* Discord server you want to connect, use the command `!setchannel <channel_id>` to designate the channel for inter-server chat. Replace `<channel_id>` with the actual ID of the channel. To get the channel ID, enable Discord Developer Mode (Settings -> Advanced -> Developer Mode), then right-click on the channel and select "Copy ID".
    *   **Important:** This step must be performed by a user with sufficient permissions (e.g., Administrator) on *each* server.

2.  **Chatting:**

    *   Type in the designated channel on any of the configured servers. Your messages will be relayed to the same channel on all other configured servers.
<br>

## Notes

*   The bot stores configuration and message history (optionally, but enabled by default) in a MongoDB database. Make sure your MongoDB instance is running and accessible to the bot.

*   Each server's inter-server channel is configured independently.

*   The bot uses `discord.js` v14.

<br>

## Support

For questions, issues, or feature requests, please open an issue on the [GitHub repository](https://github.com/CodersPlanetHQ/Global-djs-v14-bot).
