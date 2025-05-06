require('dotenv').config(); // Load environment variables from .env file

const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');

// ********************** CONFIGURATION (FROM ENV) **********************
const TOKEN = process.env.TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const COMMAND_PREFIX = process.env.COMMAND_PREFIX || '!'; // Default to '!' if not set
let INTERSERVER_CHANNEL_ID = 'SET_WITH_COMMAND'; // Default value, will be set by command

// ********************** INTENTS (REQUIRED FOR V14) **********************
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // MAKE SURE THIS IS ENABLED IN DISCORD DEVELOPER PORTAL
        GatewayIntentBits.DirectMessages,
    ],
});

// ********************** DATABASE CONNECTION (MongoDB) **********************
let db;

async function connectToDatabase() {
    try {
        const mongoClient = new MongoClient(MONGODB_URI);
        await mongoClient.connect();
        console.log('Connected to MongoDB');
        db = mongoClient.db('interserver_bot'); // Replace with your database name
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit if the database connection fails
    }
}

// ********************** BOT STARTUP **********************
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await connectToDatabase(); // Connect to the database on startup

    // Load channel IDs from the database on startup
    client.guilds.cache.forEach(async (guild) => {
        try {
            const config = await db.collection('config').findOne({ key: 'interserver_channel_id', serverId: guild.id });
            if (config && config.value) {
                INTERSERVER_CHANNEL_ID = config.value;
                console.log(`Interserver channel loaded, ID: ${INTERSERVER_CHANNEL_ID} on server ${guild.id}`);
            } else {
                console.warn(`Interserver channel not configured on server: ${guild.id}. Use !setchannel`);
            }
        } catch (error) {
            console.error(`Failed to fetch config from server ${guild.name}:`, error);
        }
    });

    // You could use this to set the bot's status across all servers
    client.user.setPresence({
        activities: [{ name: `Cross-server chat | ${COMMAND_PREFIX}help`, type: 'PLAYING' }],
        status: 'online',
    });
});

// ********************** MESSAGE HANDLING **********************
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from other bots

    // Simple command handler (can be expanded)
    if (message.content.startsWith(COMMAND_PREFIX)) {
        const args = message.content.slice(COMMAND_PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'help') {
            message.reply(`This bot facilitates cross-server chat. Use \`${COMMAND_PREFIX}setchannel <channel_id>\` to set the channel for interserver chat. Then type in that channel to chat across servers.`);
        } else if (command === 'ping') {
            message.reply('Pong!');
        } else if (command === 'setchannel') {
            if (args.length !== 1) {
                return message.reply(`Usage: \`${COMMAND_PREFIX}setchannel <channel_id>\``);
            }

            const channelId = args[0];

            if (!message.guild.channels.cache.has(channelId)) {
                return message.reply('Invalid channel ID. Make sure the channel exists in this server.');
            }

            INTERSERVER_CHANNEL_ID = channelId;

            // Persist the channel ID to DB (important for bot restarts!)
            try {
                await db.collection('config').updateOne(
                    { key: 'interserver_channel_id', serverId: message.guild.id }, // Each server needs its own config
                    { $set: { value: channelId } },
                    { upsert: true } // Creates the entry if it doesn't exist
                );
                message.reply(`Interserver channel set to <#${channelId}> on this server.`); // Mentions the channel
                console.log(`Interserver channel set to ${channelId} on server ${message.guild.id}`);

            } catch (error) {
                console.error('Failed to save channel ID to database:', error);
                message.reply('Failed to save channel ID. Interserver chat may not work after a restart.');
            }
        } else {
            message.reply(`Unknown command. Use \`${COMMAND_PREFIX}help\` for a list of commands.`);
        }
        return; // Stop processing after a command
    }

    // Inter-server chat logic (using channel ID)
    if (message.channel.id === INTERSERVER_CHANNEL_ID) {
        // 1. Store the message (optional, but good for history/audit)
        try {
            await db.collection('messages').insertOne({ // Replace 'messages' with your collection name
                serverId: message.guild.id,
                serverName: message.guild.name,
                channelId: message.channel.id,
                channelName: message.channel.name,
                authorId: message.author.id,
                authorTag: message.author.tag,
                messageId: message.id,
                content: message.content,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error('Failed to store message:', error);
            message.reply('Failed to relay your message due to a database error.');
            return;
        }

        // 2. Relay the message to other servers
        client.guilds.cache.forEach(async (guild) => {
            if (guild.id !== message.guild.id) { // Don't send the message back to the origin server
                try {
                    const config = await db.collection('config').findOne({ key: 'interserver_channel_id', serverId: guild.id });
                    if (config && config.value) {
                        const targetChannelId = config.value;
                        const targetChannel = guild.channels.cache.get(targetChannelId);
                        if (targetChannel) {
                            try {
                                await targetChannel.send({
                                    content: `**${message.author.tag}** from **${message.guild.name}**: ${message.content}`, // Include author and server info
                                    // You can add attachments/embeds here if needed.  Be careful about size limits across servers.
                                });
                            } catch (error) {
                                console.error(`Failed to send message to server ${guild.name}:`, error);
                            }
                        } else {
                            console.warn(`Interserver channel with id ${targetChannelId} not found on server: ${guild.name}`);
                        }
                    } else {
                        console.warn(`Interserver channel not configured on server: ${guild.name}. Use !setchannel`);
                    }
                } catch (error) {
                    console.error(`Failed to fetch config from server ${guild.name}:`, error);
                }
            }
        });
    }
});

// ********************** ERROR HANDLING **********************
client.on('error', console.error);
client.on('warn', console.warn);

// ********************** LOGIN **********************
client.login(TOKEN);
