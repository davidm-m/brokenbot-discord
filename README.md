# brokenbot-discord
A Discord bot using Discordie

To setup create a config.json file with your token in and edit the config variable in index.js to point to this. Create a data folder with an emotes.json file, a responses.json file, a music.json file, and a polls.json file.

Under (emotes.json).emotes you should put a dictionary of emote names to their corresponding codes (get codes by typing \\:EMOTE_NAME: in chat). You can also make arrays of related emotes.
responses.json should contain two dictionaries: contains, where the value of a key-value pair is sent as a message if any message brokenbot can see contains the key; and commands, where the value of a key-value pair is a sent as a message if a message that matches !KEY is sent. Emotes can be used in either of these provided you have correctly set up your emotes.json.

In music.json create a dictionary of song titles that a user can type in to filenames stored under /music. Files must be in mp3 format. Using the command !join CHANNEL_NAME or !join me you can get brokenbot to join a voice channel, and !play SONG_NAME and !stop control playback while !leave controls leaving a voice channel.

You should initialise polls.json with an empty array (just put a pair of square brackets). By using the command !poll create NAME, OPTION1, OPTION2, ... brokenbot will create a poll and store this in the polls.json file. The ", " is very important, it defines how brokenbot separates arguments. Without the space after the comma brokenbot will interpret OPTION1,OPTION2 as a single option! !poll vote NAME, OPTION will add your vote to the poll. Each user can only vote once per poll though they can change their vote by using the !poll vote command again. !poll view NAME displays the results of a poll, and !poll delete NAME deletes a poll.

Finally there are some custom commands set up that will only work with how I've set up my json files. These are in index.js and marked with a comment telling you to delete them if forking. Since they do something a little more complicated than simple text responses they couldn't be moved out into a json and so you should delete them lest someone accidentally calls them which would likely cause brokenbot to crash, but feel free to study how they work to get an idea of what custom commands you could make yourself.