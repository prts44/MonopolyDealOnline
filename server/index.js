// adapted from this tutorial:
// https://www.youtube.com/watch?v=djMy4QsPWiI&ab_channel=PedroTech
const gd = require('./generateDeck.js');
const dc = require('./drawCard.js');
const pf = require('./propFuncs.js');
const mpf = require('./moneyPileFuncs.js');
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { hasProps } = require('./propFuncs.js');
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let deck = [];
let trashPile = [];
let players = [];

// convention for events:
//  "send_x": client sends x data
//  "receive_x": client receives x data
//  "request_x": client asks for x data and/or some serverside change (does not send data itself)
// 
//  numbers following the events (e.g. "request_thing_1") indicates a chain of events between
//   server and client. this is used for certain action cards. number indicates order in the chain
//   and only cares about "x"; e.g. request_thing_3 implies the 3rd event in a chain, not
//   necessarily the third request.
//  if you want to follow a full chain, search for "x_#" where # is the number and x is the data

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    players.push({
        id: socket.id,
        hand: [],
        properties: [],
        moneyPile: [],
        money: 0,
        playsRemaining: 0,
        turn: false
    });
    // property storage:
    //  if no colour exists, create a new array for it
    //  if an existing one is full, create another array for it and mark it as such
    //  TREAT FULL PROPERTY SETS AS A FULL UNBREAKABLE UNIT:
    //  - set cannot have individuals taken via forced/sly deal
    //  - player cannot break the set when giving it as money; they must give the full set
    //  - houses and hotels CANNOT be removed


    socket.on("send_play_card", (card) => {
        console.log("Server received data");
        playCard(card);
    });

    socket.on("send_dealbreaker_2", (data) => {
        console.log(data);
        let victimObj = players.find((p) => p.id === data.id);
        let playerObj = players.find((p) => p.id === socket.id);
        const stolenProp = victimObj.properties.filter((p) => p.colour === data.colour)[0];
        victimObj.properties = victimObj.properties.filter((p) => p.colour !== data.colour);
        playerObj.properties.push(stolenProp);
    });

    socket.on("send_debtcollector_2", (id) => {
        console.log(id);
        const victimObj = players.find((p) => p.id === id);
        io.to(id).emit("receive_debtcollector_3", {
            victimObj: victimObj,
            playerId: socket.id
        });
    });
    
    socket.on("send_debtcollector_4", (items) => {
        let playerObj = players.find((p) => p.id === items.playerId);
        let victimObj = players.find((p) => p.id === socket.id); // the victim sends this event
        playerObj.properties = pf.addProps(playerObj.properties, items.props);
        victimObj.properties = pf.removeProps(victimObj.properties, items.props);
        playerObj.moneyPile = mpf.addMoney(playerObj.moneyPile, items.money);
        victimObj.moneyPile = mpf.removeMoney(victimObj.moneyPile, items.money);
        playerObj.money = getTotalMoney(items.playerId);
        victimObj.money = getTotalMoney(socket.id);
    });

    socket.on("send_forceddeal_2", (items) => {
        let playerObj = players.find((p) => p.id === socket.id); // the taker sends this event
        let victimObj = players.find((p) => p.id === items.victimId);
        playerObj.properties = pf.addProps(playerObj.properties, [items.taken]);
        victimObj.properties = pf.addProps(victimObj.properties, [items.given]);
        playerObj.properties = pf.removeProps(playerObj.properties, [items.given]);
        victimObj.properties = pf.removeProps(victimObj.properties, [items.taken]);
    });

    socket.on("send_slydeal_2", (items) => {
        let playerObj = players.find((p) => p.id === socket.id); // the taker sends this event
        let victimObj = players.find((p) => p.id === items.victimId);
        playerObj.properties = pf.addProps(playerObj.properties, [items.taken]);
        victimObj.properties = pf.removeProps(victimObj.properties, [items.taken]);
    });

    socket.on("send_house_2", (colour) => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.properties.filter((p) => p.colour === colour)[0].house = true;
    });

    socket.on("send_hotel_2", (colour) => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.properties.filter((p) => p.colour === colour)[0].hotel = true;
    });

    socket.on("request_new_deck", () => {
        deck = gd.generateDeck();
        socket.emit("receive_new_deck", deck);
        console.log("Generated deck");
    });

    socket.on("request_new_hand", (data) => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.hand = dc.drawCard(5, deck);
        socket.emit("receive_new_hand", {
            hand: playerObj.hand,
            deck: deck
        });
    });

    socket.on("request_hand", (data) => {
        let playerObj = players.find((p) => p.id === socket.id);
        socket.emit("receive_hand", playerObj.hand);
    });

    socket.on("request_card_draw", (data) => {
        let playerObj = players.find((p) => p.id === socket.id);
        const newCard = dc.drawCard(1, deck);
        playerObj.hand = playerObj.hand.concat(newCard);
        socket.emit("receive_card_draw", {
            newCard: newCard[0],
            hand: playerObj.hand
        });
    });

    socket.on("request_deck", (data) => {
        socket.emit("receive_deck", deck);
    });
    
    socket.on("request_turn", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.turn = true;
        playerObj.playsRemaining = 3;
    });

    socket.on("request_money", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        socket.emit("receive_money", playerObj.money);
    });

    socket.on("request_money_pile", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        socket.emit("receive_money_pile", playerObj.moneyPile);
    });

    socket.on("request_properties", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        socket.emit("receive_properties", playerObj.properties);
    });

    socket.on("request_game_state", () => {
        socket.emit("receive_game_state", players);
    });

    // i would prefer to not have these functions here but this
    //  is the only way i can think of to have cards played
    //  interact with the game state and get the correct player
    function playCard(card) {
        console.log("playCard running");
        let playerObj = players.find((p) => p.id === socket.id);
        if (card.type === "money") {
            console.log("Type check passed");
            playerObj.moneyPile.push(card);  
            // this removes the card by filtering the player's hand for all
            //  cards that don't share an internalId with the one played
            //
            // somewhat inefficient but hands can only
            //  ever have 7 so it's not too bad
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
            playerObj.money += card.value;
        } else if (card.type === "property") {
            console.log("Type check passed");
            if (playerObj.properties.filter((p) => p.colour === card.colour && p.cards.length < p.rent.length).length === 0) {
                const intId = playerObj.properties.filter((p) => p.colour === card.colour); // used to differentiate different sets of the same colour
                // TODO: implement intId
                playerObj.properties.push({
                    colour: card.colour,
                    cards: [card],
                    rent: card.rent,
                    house: false,
                    hotel: false
                });
            } else {
                playerObj.properties[playerObj.properties.findIndex((p) => p.colour === card.colour && p.cards.length < p.rent.length)].cards.push(card);
            }
            playerObj.money += card.value;
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
        } else if (card.type === "action") {
            console.log("Type check passed");
            switch(card.id) {
                // just say no logic:
                // regardless of whether or not the opposing player has a just say no, they will be
                //  asked to select it and if they want to play it. if they have no just say no,
                //  they will still have to select an option. this is to prevent the game from
                //  revealing the other player's hand information. if they play a just say no, the
                //  action card player will be asked the same thing to see if they have one as well. 
                //  if not, the deal breaker is negated. if yes, process repeats until one player
                //  cannot play just say no.
                case "dealBreaker":
                    // ask player to choose another player to steal a full property from
                    // if no other players have full properties, do not allow the card to be played
                    // once a player is chosen, the player can choose one of their full properties to steal
                    console.log("Switch case passed");
                    // filter players for players which have full properties
                    let plrsWithFullSet = players.filter((plr) => plr.properties.length > 0 && plr.properties.filter((p) => p.rent.length === p.cards.length).length > 0);
                    if (plrsWithFullSet.length === 0) {
                        socket.emit("receive_alert_message", "No other players have full properties");
                    } else {
                        socket.emit("receive_dealbreaker_1", plrsWithFullSet);
                    }
                    break;
                case "debtCollector":
                    // ask player to choose another player to steal at least $5 from
                    // opposing player must choose cards with total value >= 5
                    // if the opposing player does not have enough cards to hit value >= 5,
                    //  they give up all of their cards in play
                    console.log("Switch case passed");
                    socket.emit("receive_debtcollector_1", players);
                    break;
                case "forcedDeal":
                    // if no other players have property, card is not played and player is informed
                    // ask player to choose another player to trade property with
                    // once a player is chosen, ask player to choose which property to take
                    // then, ask player to choose which property to give
                    let plrsWithProps = players.filter((p) => hasProps(p) && p.id !== socket.id);
                    if (plrsWithProps.length === 0) {
                        socket.emit("receive_alert_message", "No other players have properties");
                    } else {
                        socket.emit("receive_forceddeal_1", {
                            plrList: plrsWithProps,
                            playerObj: playerObj
                        });
                    }
                    break; 
                case "slyDeal":
                    // if no other players have property, card is not played and player is informed
                    // ask player to choose another player to steal a property from
                    // once a player is chosen, ask player to choose which property to steal
                    let plrsWithProps_1 = players.filter((p) => hasProps(p) && p.id !== socket.id);
                    // i sincerely apologize for this gross variable naming
                    if (plrsWithProps_1.length === 0) {
                        socket.emit("receive_alert_message", "No other players have properties");
                    } else {
                        socket.emit("receive_slydeal_1", {
                            plrList: plrsWithProps_1,
                            playerObj: playerObj
                        });
                    }
                    break; 
                case "hotel":
                    let fullPropsWithHouse = playerObj.properties.filter((p) => p.cards.length >= p.rent.length && p.house === true && p.hotel == false);
                    if (fullPropsWithHouse.length === 0) {
                        socket.emit("receive_alert_message", "No full properties with house and no hotel");
                        break;
                    } else {
                        socket.emit("receive_hotel_1", fullPropsWithHouse);
                        playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                        // ask player to choose from a list of their full properties
                        //  player chooses a full property with a house
                        //  server applies house to it and removes house from their hand
                        //  if "cancel" or something else is sent, card is not played
                    }
                    break;
                case "house":
                    let fullProps = playerObj.properties.filter((p) => p.cards.length >= p.rent.length && p.house === false);
                    if (fullProps.length === 0) {
                        socket.emit("receive_alert_message", "No full properties with no house");
                        break;
                    } else {
                        socket.emit("receive_house_1", fullProps);
                        playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                        // ask player to choose from a list of their full properties
                        // player chooses a full property
                        // server applies house to it and removes house from their hand
                        // if "cancel" or something else is sent, card is not played
                    }
                    break;
                case "itsMyBirthday":
                    // ask each player to choose cards from their money pile/properties with total value >= 2
                    // if a player doesn't have enough to hit 2, automatically take all their played cards
                    break;
                case "passGo":
                    playerObj.hand = playerObj.hand.concat(dc.drawCard(2, deck));
                    playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                    break;
                default:
                    // double rent and just say no will cause this since these
                    //  can only be played under certain conditions
                    // warning message here
                    socket.emit("receive_alert_message", "Cannot play this card on its own");
                    break;
            }
        }
        socket.emit("receive_hand", playerObj.hand); // update the player's hand after playing
    }

    // gets the total money a player has in their money pile + properties
    // TODO: change existing money calculations to use this instead
    function getTotalMoney(playerId) {
        let playerObj = players.find((p) => p.id === playerId);
        let money = 0;
        // puts all played property cards into one array
        let allProps = [];
        playerObj.properties.map((p) => {
            p.cards.forEach((card) => {
                allProps.push(card);
            });
        });
        allProps.forEach((card) => {
            money += card.value;
        });
        playerObj.moneyPile.forEach((card) => {
            money += card.value;
        });
        
        return money;
    }
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});