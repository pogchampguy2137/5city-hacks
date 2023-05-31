import { Client, Events, GatewayIntentBits } from 'discord.js';
import { format } from './index.js';
const token = '';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot) return;
	let messageAttachment = message.attachments.size > 0 ? message.attachments.at(0).url : null;
	if (!messageAttachment) return;
	const data = await format(messageAttachment);
	const buffer = Buffer.from(data.img.split(',')[1], 'base64');
	message.channel.send({
		content: `Found **${data.duplicates}** duplicates from **${data.boxes}** boxes!`,
		files: [{ attachment: buffer }],
	});
});

client.login(token);
