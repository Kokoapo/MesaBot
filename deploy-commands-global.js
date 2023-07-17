// Deploy commands to all servers the bot is in (commands may take an hour to refresh)

const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

// Setup .env to get IDs constants
dotenv.config();
const { TOKEN, CLIENT_ID } = process.env;

// Import slash commands from 'commands' folder
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

const commands = [];
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

// REST Instance
const rest = new REST({ version: "10" }).setToken(TOKEN);

// Deploy Commands
(async () => {
    try {
        console.log(`Deploying ${commands.length} commands...`);
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            {body: commands}
        )
        console.log('All commands successfully deployed!');
    } catch (err) { console.error(err); }
})()