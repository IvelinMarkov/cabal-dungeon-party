require('dotenv').config();
const { Client, Intents, MessageEmbed } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(process.env.DISCORD_BOT_TOKEN).then(_ => console.log("Logged in successfully!"));

// Consts
const CMD_PREFIX = "/";
const commandsMap = {
    "createparty": createParty,
    "removeparty": removeParty
};

const partyEmbed = new MessageEmbed()
    .setColor('#0099ff')
    // .setTitle('Some title')
    // .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
    // .setDescription('Some description here')
    // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    // .addFields(
    //     { name: '\u200B', value: '\u200B' },
    //     { name: 'Inline field title', value: 'Some value here', inline: true },
    //     { name: 'Inline field title', value: 'Some value here', inline: true },
    // )
    // .addField('Inline field title', 'Some value here', true)
    // .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
// .setFooter({ text: 'Some footer text here', /*iconURL: 'https://i.imgur.com/AfFp7pu.png'*/ })



client.on('messageCreate', (message) => {
    if (!message.content.startsWith(CMD_PREFIX) || !message.member.permissions.has("ADMINISTRATOR")) return;

    let [command, ...args] = message.content.trim().substring(1).split(/\s+/);
    command = command.toLowerCase();
    if (!commandsMap.hasOwnProperty(command)) return;

    commandsMap[command](message, ...args);
})


function createParty(message, dungeonName, dateString, time) {
    const dateParts = dateString.split('/');
    const timeParts = time.split(':');
    const date = new Date();
    date.setFullYear(dateParts[2], parseInt(dateParts[1]) - 1, dateParts[0]);
    date.setHours(timeParts[0], timeParts[1], 0);

    partyEmbed.setTitle(dungeonName)
    // exampleEmbed.setDescription('React on the post to participate!');
    partyEmbed.addFields(
        { name: '📆 Date & Time', value: date.toString() },
    )
    message.channel.send({ embeds: [partyEmbed] });
}

function removeParty(message) {
    message.channel.send("Party ... has removed!");
}