require('dotenv').config();
const { Client, Intents, MessageEmbed, Emoji } = require("discord.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.login(process.env.DISCORD_BOT_TOKEN).then(_ => console.log("Logged in successfully!"));

// Consts
const CMD_PREFIX = "/";
const commandsMap = {
    "createparty": createParty,
    "removeparty": removeParty
};

const dungeonMaps = {
    "mi": "Mirage Island",
    "ami": "Awakened Mirage Island",
    "ft3": "Forgotten Template B3F",
}


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
// .setFooter({ text: 'Some footer text here', /*iconURL: 'https://i.imgur.com/AfFp7pu.png'*/ })


// const isFb = message.member.roles.cache.some(role => role.name == 'Force Blader');

let partyMessage;
let partyAuthor;
let dungeonName;
let dungeonCount;
let size;
let date;
let fbRequired;
let currentParticipants = [];

client.on('messageCreate', (message) => {
    if (!message.content.startsWith(CMD_PREFIX) || !message.member.permissions.has("ADMINISTRATOR")) return;

    let [command, dngName, dngCount] = message.content.trim().substring(1).split(/\s+/);
    command = command.toLowerCase();
    if (!commandsMap.hasOwnProperty(command)) return;

    dungeonName = dungeonMaps[dngName];
    dungeonCount = dngCount;

    commandsMap[command](message);
})

client.on('messageReactionAdd', (reaction, user) => {
    if (!partyMessage.id || reaction.message.id != partyMessage.id || user.bot || currentParticipants.some(u => u.id == user.id)) return;

    currentParticipants.push(user);
    const partyEmbed = createEmbed();
    partyMessage.edit({ embeds: [partyEmbed] });
})

client.on('messageReactionRemove', (reaction, user) => {
    if (!partyMessage.id || reaction.message.id != partyMessage.id || user.bot || partyAuthor.id == user.id) return;

    const userIndex = currentParticipants.findIndex(u => u.id == user.id);
    currentParticipants.splice(userIndex, 1);
    const partyEmbed = createEmbed();
    partyMessage.edit({ embeds: [partyEmbed] });
})

async function createParty(message) {

    await message.channel.send("When?");
    date = await waitForCreator();
    await message.channel.send("Max party size?");
    size = await waitForCreator();
    await message.channel.send("Do you require a Force Blader?");
    fbRequired = await waitForCreator();

    currentParticipants.push(message.author);
    partyAuthor = message.author;

    const partyEmbed = createEmbed();
    const newMessage = await message.channel.send({ embeds: [partyEmbed] });
    await newMessage.react('➕');

    partyMessage = newMessage;
}

function removeParty(message) {
    message.channel.send("Party ... has been removed!");
}

function waitForCreator() {
    return new Promise((resolve) => {
        client.once('messageCreate', (message) => {
            resolve(message.content);
        })
    })
}

function createEmbed() {
    const users = currentParticipants.map(p => p.toString()).join('\n');
    return new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(dungeonName)
        // exampleEmbed.setDescription('React on the post to participate!');
        .addFields(
            { name: '🔄 Dungeon Count', value: dungeonCount },
            { name: '📆 Date & Time', value: date },
            { name: '👑 Creator', value: partyAuthor.toString() },
            { name: '🐒', value: `${currentParticipants.length}/${size}\n${users}` },
            { name: '✝ Force Blader Required', value: fbRequired },
        )
        .setTimestamp()
}
