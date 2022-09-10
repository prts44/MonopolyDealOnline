# Monopoly Deal Online
A digital version of the card game Monopoly Deal. Currently, this project uses React and Socket.io.

You can find the rules for monopoly deal [here](http://monopolydealrules.com/index.php?page=play).

<b>NOTE:</b>

The rules differ slightly for this online version due to the way I've implemented it. I would like to remove these differences, but I want to have something that works before that. The scenarios where these differences will matter are somewhat uncommon, but not impossible and will likely impact some games, so I don't want to keep them for very long. Removing these differences will require me to redo most of the property handling as they are edge cases that I failed to notice somewhat late into development.

If I ever host this project publicly, expect there to only be one room for games that you can join and anyone can start for now. This is due to some limitations with Socket.io that I didn't notice until it was too late. I would absolutely love to have multiple rooms, but right now the game works best as a self-hosted one with friends. This is something I'd like to fix in the future.

## Screenshots
TODO

## How to host this on your own server
Basically, you need to have two things running:
- The server on port 3001 (or whichever one you change it to)
- The client on port 3000 (or whichever one you change it to)

Once both are running, all you need to do is go to the url/ip of the client host, and you should be able to play the game from there. Any other players just have to connect to the client. (I have not tested this as of writing this version of the README since the project is not complete)

## Progress
65% done.

Cards remaining:
- Just Say No integrations for some action cards
- Wild properties

Other things to do:
- Graphics
- Ability to play a proper game (basically turns and a win check)
- Hand size check
- Played pile interactions
- Display usernames

Extras:
- New mode featuring custom cards
