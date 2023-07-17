const { SlashCommandBuilder } = require('discord.js');

const replies = ["Hi!", "HiHiiiiiii!!!", "Hewooooooo :3", "EEEEEEEEEEEEE", "Yeeeeeeehawwww", "AWOGA >:>"];
module.exports = {
    data: new SlashCommandBuilder()
        .setName("talk")
        .setDescription("Talks with you!"),

    async execute(interaction) {
        const reply = Math.floor(Math.random() * replies.length);
        await interaction.reply(replies[reply]);
    }
}