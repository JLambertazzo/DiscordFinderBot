const Discord = require('discord.js');
const https = require('https');
const client = new Discord.Client();
const prefix = '!';

client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.token);

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if(command === 'find') {
		if(args.length < 1) {
			return message.channel.send('usage: !find place');
		}

		let query = args[0];
		for(let i = 1; i < args.length; i++) {
			query += '+' + args[i];
		}

		const latbias = 43.6628917;
		const lngbias = -79.3956564;
		const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${process.env.gkey}&location=${latbias},${lngbias}&radius=1&query=${query}`;
		let response = '';
		// got code from https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
		https.get(url, (resp)=>{
			let data = '';

			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				data = JSON.parse(data);
				if(data.status === 'OK') {
					response += 'The following locations matched your search:\r\n';
					for(let i = 0; i < data.results.length; i++) {
						if(i > 4) break;
						response += `${i + 1}: ${data.results[i].name} at ${data.results[i].formatted_address}\r\n`;
					}
					message.channel.send(response);
				}
				else if(data.status === 'ZERO_RESULTS') {
					message.channel.send('No results found for your search');
				}
				else{
					message.channel.send('Couldn\'t complete your search...');
				}
			});
		});
	}
});
