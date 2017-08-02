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

function reset() {
	fs.readFile("./data/emotes.json","utf-8", (err, data) => {
		if (err) throw err;
		emotes = JSON.parse(data);
	})
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