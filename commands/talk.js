const { SlashCommandBuilder } = require('discord.js');

// /talk command: Picks up a random string inside the replies array and replies with this string
const replies = ["Hi!", "HiHiiiiiii!!!", "HAIHAIIIIII", "Hewooooooo :3", "EEEEEEEEEEEEE", "Yeeeeeeehawwww", "AWOGA >:>"];
module.exports = {
    data: new SlashCommandBuilder()
        .setName("talk")
        .setDescription("Talks with you!"),

    async execute(interaction) {
        const reply = Math.floor(Math.random() * replies.length);
        await interaction.reply(replies[reply]);
    }
}