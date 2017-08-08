"use strict";

const Discordie = require("discordie");
const fs = require("file-system");
const readline = require("readline");
const lame = require("lame");

const bot = new Discordie({autoReconnect: true});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on("line", (input) => {
	if (input === "reset") {
		reset();
	}
});

let emotes;
let responses;
let music;
let testConfig = "./configWeeb.json";
let config = "./configBroken.json";

if (process.argv[2] === "test") {
	console.log("Running weeb-bot");
	fs.readFile(testConfig,"utf-8", (err, data) => {
		if (err) throw err;
		let parsed = JSON.parse(data);
		bot.connect({
			token: parsed.token
		});
	});
} else {
	fs.readFile(config,"utf-8", (err, data) => {
		if (err) throw err;
		let parsed = JSON.parse(data);
		bot.connect({
			token: parsed.token
		});
	});
}

bot.Dispatcher.on("GATEWAY_READY", e => {
	console.log("Here we go again.");
});

bot.Dispatcher.on("DISCONNECTED", e => {
	console.log(e.error);
});

bot.Dispatcher.on("GATEWAY_RESUMED", e => {
	console.log("Lost it for a second there, but I'm back.");
});

reset();

bot.Dispatcher.on("MESSAGE_CREATE", e => {
	let prefix = "!";
	if (e.message.author.bot) {
		return; //don't respond to messages sent by bots
	}
	if (!e.message.content.startsWith(prefix)) {
		for (let key in responses.contains) {
			if (e.message.content.includes(parseEmotes(key))) {
				e.message.channel.sendMessage(parseEmotes(getRand(responses.contains[key])));
			}
		}
		return;
	}
	let message = e.message.content.substring(1);
	if (responses.commands[message]) {
		return e.message.channel.sendMessage(responses.commands[message]);
	}
	if (message.startsWith("tts")) {
		let ttsChoice = message.slice(4);
		if (ttsChoice === null) {
			return e.Message.channel.sendMessage("You need to pick something, numbnuts",true);
		}
		else if (responses.commands[ttsChoice]) {
			return e.message.channel.sendMessage(responses.commands[ttsChoice],true);
		}
		else {
			return e.message.channel.sendMessage("I'm afraid I can't do that Dave.",true);
		}
	}
	if (message.startsWith("join")) {
		let arg = message.slice(5);

		if (arg.toLowerCase() === "me") {
			if (e.message.member.getVoiceChannel()) {
				e.message.member.getVoiceChannel().join()
				 .catch(console.error);
			} else {
				e.message.channel.sendMessage("Join a channel first, ya eejit.");
			}
		} else if (arg.toLowerCase() === "us") {
			e.message.channel.sendMessage("Scott that's still not a command.");
		} else {
			let vchannel =
      		e.message.channel.guild.voiceChannels
      		 .find(channel => channel.name.toLowerCase().indexOf(arg.toLowerCase()) >= 0);
    		if (vchannel) {
    			vchannel.join()
    			 .catch(console.error);
    		} else {
    			e.message.channel.sendMessage("How dumb do you have to be to not even give me an actual channel.");
    		}
		}
		return;
	}
	if (message === "leave") {
		return bot.VoiceConnections[0].voiceConnection.disconnect();
	}
	if (message.startsWith("play")) {
		if (!bot.VoiceConnections.length) {
	    		return e.message.reply("this would work better if I were in a channel.");
	  		}
		let arg = message.slice(5);
			let info = bot.VoiceConnections.getForGuild(e.message.guild);
		let songName;
			for (let key in music) {
				if (key.toLowerCase().indexOf(arg.toLowerCase()) >= 0) {
					songName = key;
					break;
				}
			}
		if (songName) {
			return play(info,"music\\"+music[songName],e);
		} else {
			return e.message.reply("I don't know that song.");
		}
	}
	if (message === "songs") {
		let songs = "";
		for (let key in music)
			songs += "\n" + key;

		return e.message.channel.sendMessage("Here's the songs I know:\n" + songs);
	}
	if (message === "scream") {
		if (!bot.VoiceConnections.length) {
      		return e.message.reply("this would work better if I were in a channel.");
    	}
    	let info = bot.VoiceConnections.getForGuild(e.message.guild);
    	return play(info,"music\\scream.mp3",e);
	}
	if (message === "gfg") {
		let mark = emotes.emotes[getRand(emotes.Mark)] + " ";
		let dani = emotes.emotes[getRand(emotes.Dani)] + " ";
		let scott = emotes.emotes[getRand(emotes.Scott)] + " ";
		let adam = emotes.emotes[getRand(emotes.Adam)] + " ";
		let dave = emotes.emotes[getRand(emotes.Dave)];
		return e.message.channel.sendMessage(mark + dani + scott + adam + dave);
	}
	return e.message.channel.sendMessage("I might be broken, but that's not even a command.");
})

function play(info,song,e) {
  if (!bot.VoiceConnections.length) {
    return e.message.reply("this would work better if you put me in a channel.");
  }

  if (!info) info = bot.VoiceConnections[0];

  let mp3decoder = new lame.Decoder();
  let file = fs.createReadStream(song);
  file.on('open', function() {
  	file.pipe(mp3decoder);

  	mp3decoder.on('format', pcmfmt => {
    // note: discordie encoder does resampling if rate != 48000
    	let options = {
     		frameDuration: 60,
      		sampleRate: pcmfmt.sampleRate,
      		channels: pcmfmt.channels,
      		float: false
    	};

    	let encoderStream = info.voiceConnection.getEncoderStream(options);
    	if (!encoderStream) {
      		return console.log("Unable to get encoder stream, connection is disposed");
    	}

    	// Stream instance is persistent until voice connection is disposed;
    	// you can register timestamp listener once when connection is initialized
    	// or access timestamp with `encoderStream.timestamp`
    	encoderStream.resetTimestamp();
    	encoderStream.removeAllListeners("timestamp");
    	//encoderStream.on("timestamp", time => console.log("Time " + time));

    	// only 1 stream at a time can be piped into AudioEncoderStream
    	// previous stream will automatically unpipe
    	mp3decoder.pipe(encoderStream);
    	//mp3decoder.once('end', () => play(info));

    	// must be registered after `pipe()`
    	encoderStream.once("unpipe", () => file.destroy());
 	});
  });
  file.on('error', function(err) {
  	e.message.reply("I probably don't know that song.");
  });
}

function parseEmotes(data) {
	let matchArr = data.match(/:[a-zA-Z]+:/g);
	let cleaned = data;
	if (!matchArr) {
		return data;
	}
	let emoteArr = [];
	for (let i = 0; i < matchArr.length - 1; i++) {
		let found = false;
		for (let j = 0; j < emoteArr.length; j++) {
			if (matchArr[i] === emoteArr[j]) {
				found = true;
			}
		}
		if (found === false) {
			emoteArr.push(matchArr[i]);
		}
	}
	for (let i = 0; i < emoteArr.length; i++) {
		if (emotes.emotes[emoteArr[i].slice(1,-1)]) {
			let splitArr = cleaned.split(emoteArr[i]);
			cleaned = splitArr.join(emotes.emotes[emoteArr[i].slice(1,-1)]);
		}
	}
	return cleaned;
}

function reset() {
	fs.readFile("./data/emotes.json", "utf-8", (err, data) => {
		if (err) throw err;
		emotes = JSON.parse(data);
	});
	fs.readFile("./data/responses.json", "utf-8", (err, data) => {
		if (err) throw err;
		responses = JSON.parse(data);
	});
	fs.readFile("./data/music.json", "utf-8", (err, data) => {
		if (err) throw err;
		music = JSON.parse(data);
	});
}

function getRand(array) {
	return array[Math.floor(Math.random()*array.length)];
}

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}