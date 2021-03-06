import * as Discord from 'discord.js';

import conf from '../config';

import { Commands, Command } from './cmd';

class ClientWithCommands extends Discord.Client {
    public commands: Discord.Collection<string, Command>;

    constructor() {
        super();
        this.commands = new Discord.Collection();
    }
}

const client = new ClientWithCommands();

const cmdPrefix = '/';

Commands.forEach((cmd) => {
    client.commands.set(cmd.name, cmd);
});

client.on('message', async (message) => {
    console.log('message received: ', message.content);
    if (!message.content.startsWith(cmdPrefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(cmdPrefix.length).trim().split(/ +/);
    const cmd = (args || []).shift()?.toLowerCase() || '';

    if (!client.commands.has(cmd)) {
        console.debug('message does not match a known command', message);
        return;
    }

    await client.commands.get(cmd)?.execute(message, args);
});

client.on('error', (err) => {
    console.error('error', err);
});

client.on('shardError', (err) => {
    console.error('shardError', err);
});

client.on('rateLimit', (rateLimitInfo: Discord.RateLimitData) => {
    console.error('rate limit error', rateLimitInfo);
});

client.on('ready', async () => {
    console.log('client is ready');

    const guild = await client.guilds.fetch(conf.discord.guild.aruins.id);
    console.log(`number of members: ${guild.members.cache.array().length}`);
});

export default client;
