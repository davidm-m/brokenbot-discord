"use strict";

var Discordie = require("discordie");
var fs = require("file-system");
var readline = require("readline");

var bot = new Discordie({autoReconnect: true});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on("line", (input) => {
	if (input === "reset") {
		reset();
	}
});

var emotes;
var responses;
var testConfig = "./configWeeb.json";
var config = "./configBroken.json";

if (process.argv[2] === "test") {
	console.log("Running weeb-bot");
	fs.readFile(testConfig,"utf-8", (err, data) => {
		if (err) throw err;
		var parsed = JSON.parse(data);
		bot.connect({
			token: parsed.token
		});
	});
} else {
	fs.readFile(config,"utf-8", (err, data) => {
		if (err) throw err;
		var parsed = JSON.parse(data);
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
	for (var key in responses.contains) {
		if (e.message.content.includes(parseEmotes(key))) {
			e.message.channel.sendMessage(parseEmotes(getRand(responses.contains[key])));
		}
	}
	if (!e.message.content.startsWith(prefix)) {
		return;
	}
	var message = e.message.content.substring(1);
	if (responses.commands[message]) {
		e.message.channel.sendMessage(responses.commands[message]);
	}
})

function parseEmotes(data) {
	var matchArr = data.match(/:[a-zA-Z]+:/g);
	var cleaned = data;
	if (!matchArr) {
		return data;
	}
	var emoteArr = [];
	for (var i = 0; i < matchArr.length - 1; i++) {
		var found = false;
		for (var j = 0; j < emoteArr.length; j++) {
			if (matchArr[i] === emoteArr[j]) {
				found = true;
			}
		}
		if (found === false) {
			emoteArr.push(matchArr[i]);
		}
	}
	for (var i = 0; i < emoteArr.length; i++) {
		if (emotes.emotes[emoteArr[i].slice(1,-1)]) {
			var splitArr = cleaned.split(emoteArr[i]);
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