const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function getOrders(item) {
    try {
        const response = await axios.get(`https://api.warframe.market/v1/items/${item}/orders`);
        //console.log(response.data.payload.orders);
        return response.data.payload.orders;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function getBestOrders(orders, len) {
    var buyer, seller;
    for (var i = 0; i < len; i++) {
        if (orders[i].order_type === 'sell' && (seller == null || orders[i].platinum < seller.platinum)) seller = orders[i];
        if (orders[i].order_type === 'buy' && (buyer == null || orders[i].platinum > buyer.platinum)) buyer = orders[i];
    }

    return { buyer, seller };
}

function createEmbed(item, buyer, seller) {
    var itemName = item[0].toUpperCase();
    itemName = itemName.replace(/_/g, ' ');

    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(itemName)
        .setURL(`https://warframe.market/items/${item}`)
        .addFields(
            { name: 'Best sell price', value: `${seller.platinum} by ${seller.user.ingame_name}`, inline: true },
            { name: 'Best buy price', value: `${buyer.platinum} by ${buyer.user.ingame_name}`, inline: true },
        );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("market")
        .setDescription("Shows a warframe.market item")
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Full Name of the item, separated by spaces')
                .setRequired(true)
        ),

    async execute(interaction) {
        var item = interaction.options.getString('item').toLowerCase();
        item = item.replace(/ /g, '_');
        const apiRes = await getOrders(item);

        if (apiRes != null) {
            const { buyer, seller } = getBestOrders(apiRes, Object.keys(apiRes).length);
            // console.log(buyer, seller);
            const embed = createEmbed(item, buyer, seller);
            await interaction.reply({ embeds: [embed] });
        } else await interaction.reply("Failed to connect with warframe.market! Make sure the item name is written correctly");
    }
}