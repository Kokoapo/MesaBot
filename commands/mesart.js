const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv')

// Global constants
// Connects dotenv with project root folder .env file
dotenv.config({ path: '../.env' })
const { DEVIANTART_CLIENT_ID, DEVIANTART_CLIENT_SECRET } = process.env;
const GRANT_TYPE = "client_credentials"
const TAG_NAME = "warframemesa";

// Uses client id and secret to generate an authentication token to get access to the tags route
// Returns a JSON object with the response data
async function getToken() {
    try {
        const res = await axios.get(`https://www.deviantart.com/oauth2/token?grant_type=${GRANT_TYPE}&client_id=${DEVIANTART_CLIENT_ID}&client_secret=${DEVIANTART_CLIENT_SECRET}`);
        return res.data;
    } catch (err) { console.log(err); }
    return null;
}

// Gets all arts on the tag
// Returns a JSON object with the response data
async function getArts() {
    const tokenRes = await getToken();
    if (tokenRes != null && tokenRes.status === "success") {
        try {
            const res = await axios.get(`https://www.deviantart.com/api/v1/oauth2/browse/tags?tag=${TAG_NAME}&access_token=${tokenRes.access_token}`);
            return res.data;
        } catch (err) { console.log(err); }
    }
    return null;
}

// Get a random art inside the array
function getRandomArt(arts, size) {
    return arts[Math.floor(Math.random() * size)];
}

// Create embed to show the art
// Embed contains author name, page link, icon, art title, url and the image itself
function createEmbed(art) {
    return new EmbedBuilder()
        .setColor(0xF9C10F)
        .setTitle(art.title)
        .setAuthor({ name: art.author.username, iconURL: art.author.usericon, url: `https://www.deviantart.com/${art.author.username}` })
        .setURL(art.url)
        .setImage(art.content.src)
        .setFooter({ text: 'Yeehaw >:3' });
}

// /mesart command: Shows a random fanart from the Deviantart TAG_NAME tag search
module.exports = {
    data: new SlashCommandBuilder()
        .setName("mesart")
        .setDescription("Shows a random mesa fanart from Deviantart!"),

    async execute(interaction) {
        const arts = await getArts();

        if (arts != null) {
            const art = getRandomArt(arts.results, Object.keys(arts).length);
            const embed = createEmbed(art);
            await interaction.reply({ embeds: [embed] });
        } else await interaction.reply("Failed to connect with Deviantart!")
    }
}