const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

// Setup .env to get IDs and Token constants
dotenv.config();
const { TOKEN } = process.env;

// Create Client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Deploy slash commands from 'commands' folder
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath)
    if ("data" in command && "execute" in command)
        client.commands.set(command.data.name, command);
}

// Once client is ready, run this code (only once) 
client.once(Events.ClientReady, c => {
    console.log(`${c.user.tag} Ready!`);
});

// Log in to Discord with token
client.login(TOKEN);

// Commands Listener
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) return;

    try { await command.execute(interaction); }
    catch(err) {
        console.error(err);
        await interaction.reply("Error Executing the command :(");
    }
});