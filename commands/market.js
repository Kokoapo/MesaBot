const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Get on warframe.market's API item/orders route
// Returns the JSON object with all orders or null
async function getOrders(item) {
    try {
        const response = await axios.get(`https://api.warframe.market/v1/items/${item}/orders`);
        return response.data.payload.orders;
    } catch (err) { console.log(err); }
    return null;
}

// Get the best orders (lower sell price and higher buy price) on the orders JSON object
// Only search for the best prices for visible orders and non-offline users
// Returns both the best buy (buyer) and the best sell (seller) objects
function getBestOrders(orders, len) {
    var buyer, seller;
    for (var i = 0; i < len; i++) {
        if (orders[i].order_type === 'sell' && orders[i].visible == true && orders[i].user.status != 'offline' && (seller == null || orders[i].platinum < seller.platinum)) seller = orders[i];
        if (orders[i].order_type === 'buy' && orders[i].visible == true && orders[i].user.status != 'offline' && (buyer == null || orders[i].platinum > buyer.platinum)) buyer = orders[i];
    }

    return { buyer, seller };
}

// Creates and returns embed with information about the best seller and buyer
// The embed contains the item name, the link to the item's warframe.market page, both item's price, quantity, platform, region, user name, status and reputation
function createEmbed(item, buyer, seller) {
    var itemName = item.replace(item[0], item[0].toUpperCase());
    itemName = itemName.replace(/_/g, ' ');

    return new EmbedBuilder()
        .setColor(0xF9C10F)
        .setTitle(itemName)
        .setURL(`https://warframe.market/items/${item}`)
        .setDescription('Informations about the best orders found (lowest sell price and highest buy price) from non-offline players')
        .addFields(
            { name: 'Best sell price', value: `${seller.platinum} plat, ${seller.quantity} available`, inline: true },
            { name: 'Order Informations', value: `${seller.platform.toUpperCase()} - ${seller.region.toUpperCase()}`, inline: true },
            { name: 'User Informations', value: `${seller.user.ingame_name} (${seller.user.status}), Reputation: ${seller.user.reputation}`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Best buy price', value: `${buyer.platinum} plat, ${buyer.quantity} available`, inline: true },
            { name: 'Order Informations', value: `${buyer.platform.toUpperCase()} - ${buyer.region.toUpperCase()}`, inline: true },
            { name: 'User Informations', value: `${buyer.user.ingame_name} (${buyer.user.status}), Reputation: ${buyer.user.reputation}`, inline: true },
        )
        .setImage('https://warframe.market/static/build/resources/images/logo-black.3bec6a3a0f1e6f1edbb1.png')
        .setTimestamp()
        .setFooter({ text: 'Yeehaw >:3' });
}

// /market command: receives an item name and replies with an embed containing the market page link and information about the best orders found (WTB and WTS)
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
            const embed = createEmbed(item, buyer, seller);
            await interaction.reply({ embeds: [embed] });
        } else await interaction.reply("Failed to connect with warframe.market! Make sure the item name is written correctly");
    }
}