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
let playedPile = [];
let players = [];
let currentTurn = null;
let turnOrder = [];
let gameActive = false;

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

    // only add a player to the game if the client requests
    socket.on("request_enter_game", (username) => {
        if (gameActive) {
            socket.emit("receive_alert_message", "You can't join an ongoing game.");
        } else if (players.length === 0 || players.filter((p) => p.id === socket.id).length === 0) {
            players.push({
                id: socket.id,
                hand: [],
                properties: [],
                moneyPile: [],
                money: 0,
                playsRemaining: 0,
                username: username,
                turn: false,
                pendingActions: 0 // will be used for JSN chains where the player must wait to see how the other player reacts
            });
            socket.emit("receive_client_update", {
                otherPlayers: players.filter((p) => p.id !== socket.id),
                playerData: players.find((p) => p.id === socket.id)
            });
        }
    });

    // property storage:
    //  if no colour exists, create a new array for it
    //  if an existing one is full, create another array for it and mark it as such
    //  TREAT FULL PROPERTY SETS AS A FULL UNBREAKABLE UNIT:
    //  - set cannot have individuals taken via forced/sly deal
    //  - player cannot break the set when giving it as money; they must give the full set
    //  - houses and hotels CANNOT be removed
    //  this differs from the actual game however:
    //  - this is a somewhat uncommon case
    //  - i would need to restructure most of the property handling again to
    //    make it 100% accurate, which i would like to do in the future but not before
    //    getting a 95% functional and correct version finished

    /*  format for events which require a JSN chain check:
        io.to(items.id).emit("receive_justsayno_1", {
            cards: victimObj.hand.filter((c) => c.type === "action" && c.id === "justSayNo"), 
            nextEvent: [{event name}, {parameters}] (ONLY CHANGE THIS PART)
            starterId: socket.id,
            nextReceiverId: socket.id,
            noCount: 0
        });
    */

    socket.on("send_play_card", (card) => {
        console.log("Server received data");
        playCard(card);
    });

    socket.on("send_play_card_as_money", (card) => {
        console.log("Server received data");
        playCardAsMoney(card);
    });

    socket.on("send_dealbreaker_2", (items) => {
        let victimObj = players.find((p) => p.id === items.id);
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.pendingActions++;
        io.to(items.id).emit("receive_justsayno_1", {
            cards: victimObj.hand.filter((c) => c.type === "action" && c.id === "justSayNo"), 
            nextEvent: ["receive_dealbreaker_3", {
                receiverId: socket.id,
                colour: items.colour,
                victimId: items.id
            }], 
            starterId: socket.id,
            nextReceiverId: socket.id,
            noCount: 0
        });
    });

    // does the dealbreaker steal after a JSN chain
    socket.on("send_dealbreaker_4", (items) => {
        let victimObj = players.find((p) => p.id === items.victimId);
        let playerObj = players.find((p) => p.id === items.receiverId);
        const stolenProp = victimObj.properties.filter((p) => p.colour === items.colour)[0];
        victimObj.properties = victimObj.properties.filter((p) => p.colour !== items.colour);
        playerObj.properties.push(stolenProp);
        playerObj.pendingActions--;
        updateClients();
    })

    socket.on("send_takemoney_2", (items) => {
        let victimObj = players.find((p) => p.id === items.id);
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.pendingActions++;
        io.to(items.id).emit("receive_justsayno_1", {
            cards: victimObj.hand.filter((c) => c.type === "action" && c.id === "justSayNo"), 
            nextEvent: ["receive_takemoney_3", {
                victimObj: victimObj,
                playerId: socket.id,
                amt: items.amt
            }],
            starterId: socket.id,
            nextReceiverId: socket.id,
            noCount: 0
        });
    });
    
    socket.on("send_takemoney_4", (items) => {
        let playerObj = players.find((p) => p.id === items.playerId);
        let victimObj = players.find((p) => p.id === socket.id); // the victim sends this event
        playerObj.properties = pf.addProps(playerObj.properties, items.props);
        victimObj.properties = pf.removeProps(victimObj.properties, items.props);
        playerObj.moneyPile = mpf.addMoney(playerObj.moneyPile, items.money);
        victimObj.moneyPile = mpf.removeMoney(victimObj.moneyPile, items.money);
        playerObj.money = getTotalMoney(items.playerId);
        victimObj.money = getTotalMoney(socket.id);
        playerObj.pendingActions--;
        updateClients();
    });

    socket.on("send_forceddeal_2", (items) => {
        let victimObj = players.find((p) => p.id === items.victimId);
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.pendingActions++;
        io.to(items.victimId).emit("receive_justsayno_1", {
            cards: victimObj.hand.filter((c) => c.type === "action" && c.id === "justSayNo"), 
            nextEvent: ["receive_forceddeal_3", {
                victimId: items.victimId,
                receiverId: socket.id,
                taken: items.taken,
                given: items.given,
            }],
            starterId: socket.id,
            nextReceiverId: socket.id,
            noCount: 0
        });
    });

    socket.on("send_forceddeal_4", (items) => {
        let playerObj = players.find((p) => p.id === items.receiverId); // the taker sends this event
        let victimObj = players.find((p) => p.id === items.victimId);
        playerObj.properties = pf.addProps(playerObj.properties, [items.taken]);
        victimObj.properties = pf.addProps(victimObj.properties, [items.given]);
        playerObj.properties = pf.removeProps(playerObj.properties, [items.given]);
        victimObj.properties = pf.removeProps(victimObj.properties, [items.taken]);
        playerObj.pendingActions--;
        updateClients();
    });

    socket.on("send_slydeal_2", (items) => {
        let victimObj = players.find((p) => p.id === items.victimId);
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.pendingActions++;
        io.to(items.victimId).emit("receive_justsayno_1", {
            cards: victimObj.hand.filter((c) => c.type === "action" && c.id === "justSayNo"), 
            nextEvent: ["receive_slydeal_3", {
                victimId: victimObj.id,
                receiverId: socket.id,
                taken: items.taken,
            }],
            starterId: socket.id,
            nextReceiverId: socket.id,
            noCount: 0
        });
    });

    socket.on("send_slydeal_4", (items) => {
        let playerObj = players.find((p) => p.id === items.receiverId);
        let victimObj = players.find((p) => p.id === items.victimId);
        playerObj.properties = pf.addProps(playerObj.properties, [items.taken]);
        victimObj.properties = pf.removeProps(victimObj.properties, [items.taken]);
        playerObj.pendingActions--;
        updateClients();
    });

    socket.on("send_house_2", (colour) => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.properties.filter((p) => p.colour === colour)[0].house = true;
        updateClients();
    });

    socket.on("send_hotel_2", (colour) => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.properties.filter((p) => p.colour === colour)[0].hotel = true;
        updateClients();
    });

    socket.on("send_singlerent_2", (colour) => {
        let playerObj = players.find((p) => p.id === socket.id);
        socket.emit("receive_singlerent_3", {
            cards: playerObj.hand.filter((p) => p.type === "action" && p.id === "doubleRent"),
            colour: colour
        });
    });

    socket.on("send_singlerent_4", (items) => {
        let playerObj = players.find((p) => p.id === socket.id);
        if (items.drCard !== null) {
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== items.drCard.internalId);
        }
        const propSet = playerObj.properties.filter((p) => p.colour === items.colour && p.internalId === 0)[0]; // only use internalId 0 since that will ALWAYS be the highest value one
        requestIndividualMoney(pf.calcRent(propSet) * items.mult);
        updateClients();
    });

    socket.on("send_multirent_2", (colour) => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.pendingActions += players.length - 1;
        socket.emit("receive_multirent_3", {
            cards: playerObj.hand.filter((p) => p.type === "action" && p.id === "doubleRent"),
            colour: colour
        });
    });

    socket.on("send_multirent_4", (items) => {
        let playerObj = players.find((p) => p.id === socket.id);
        if (items.drCard !== null) {
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== items.drCard.internalId);
        }
        const propSet = playerObj.properties.filter((p) => p.colour === items.colour && p.internalId === 0)[0]; // only use internalId 0 since that will ALWAYS be the highest value one
        requestAllMoney(pf.calcRent(propSet) * items.mult);
    });

    socket.on("send_justsayno_2", (items) => {
        let playerObj = players.find((p) => p.id === items.nextReceiverId);
        let senderObj = players.find((p) => p.id === socket.id); // used to clear the sender's JSN
        senderObj.hand = senderObj.hand.filter((c) => c.internalId !== items.card.internalId);
        playedPile.push(items.card);
        console.log(items.nextReceiverId);
        io.to(items.nextReceiverId).emit("receive_justsayno_1", {
            cards: playerObj.hand.filter((c) => c.type === "action" && c.id === "justSayNo"), 
            nextEvent: items.nextEvent,
            starterId: items.starterId,
            nextReceiverId: socket.id,
            noCount: items.noCount
        });
    });

    socket.on("send_wildproperty_2", (items) => {
        let playerObj = players.find((p) => p.id === socket.id);
        let newCard = items.card;
        newCard.colour = items.colour;
        newCard.type = "property";
        newCard.rent = pf.getRentFromColour(items.colour);
        newCard.name = "Wild Property";
        playerObj.properties = pf.addProps(playerObj.properties, [newCard]);
        updateClients();
    })

    socket.on("request_new_deck", () => {
        deck = gd.generateDeck();
        socket.emit("receive_new_deck", deck);
        console.log("Generated deck");
    });

    socket.on("request_new_hand", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.hand = dc.drawCard(5, deck);
        socket.emit("receive_new_hand", {
            hand: playerObj.hand,
            deck: deck
        });
    });

    socket.on("request_hand", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        socket.emit("receive_hand", playerObj.hand);
    });

    socket.on("request_card_draw", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        if (deck.length < 1) {
            deck = deck.concat(shuffle(playedPile));
            playedPile = [];
        }
        const newCard = dc.drawCard(1, deck);
        playerObj.hand = playerObj.hand.concat(newCard);
        socket.emit("receive_card_draw", {
            newCard: newCard[0],
            hand: playerObj.hand
        });
    });

    socket.on("request_deck", () => {
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

    socket.on("request_emit_event_from_server", (event, params) => {
        socket.emit(event, params);
    });

    socket.on("request_tutor_card", (id) => {
        let playerObj = players.find((p) => p.id === socket.id);
        let draw = dc.tutorCard(id, deck);
        if (draw) {
            playerObj.hand.push(draw);
        }
        deck = deck.filter((c) => c.internalId !== id);
    });

    socket.on("request_start_game", () => {
        if (gameActive) {
            socket.emit("receive_alert_message", "There is already a game going on.");
        } else {
            startGame();
        }
    })

    socket.on("request_end_turn", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        if (playerObj.turn === false) {
            socket.emit("receive_alert_message", "It is not your turn.");
        } else {
            endTurn();
        }
    });

    socket.on("request_remove_pending_action", () => {
        let playerObj = players.find((p) => p.id === socket.id);
        playerObj.pendingActions--;
    });

    // i would prefer to not have these functions here but this
    //  is the only way i can think of to have cards played
    //  interact with the game state and get the correct player
    function playCard(card) {
        console.log("playCard running");
        let playerObj = players.find((p) => p.id === socket.id);
        if (playerObj.turn === false) {
            socket.emit("receive_alert_message", "It is not your turn.");
            return;
        } else if (playerObj.playsRemaining === 0) {
            socket.emit("receive_alert_message", "You have already played 3 cards this turn.");
            return;
        } else if (playerObj.pendingActions > 0) {
            socket.emit("receive_alert_message", "Wait for the other player(s) to respond to your previous play.");
            return;
        }
        if (card.type === "money") {
            console.log("Type check passed");
            playerObj.moneyPile.push(card);  
            // this removes the card by filtering the player's hand for all
            //  cards that don't share an internalId with the one played
            //
            // somewhat inefficient but hands can't go super high so it shouldn't be noticeable
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
            playerObj.money = getTotalMoney(socket.id);
            playerObj.playsRemaining -= 1;
        } else if (card.type === "property") {
            console.log("Type check passed");
            playerObj.properties = pf.addProps(playerObj.properties, [card]);
            playerObj.money = getTotalMoney(socket.id);
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
            playerObj.playsRemaining -= 1;
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
                        playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                        playedPile.push(card);
                        playerObj.playsRemaining -= 1;
                    }
                    break;
                case "debtCollector":
                    // ask player to choose another player to steal at least $5 from
                    // opposing player must choose cards with total value >= 5
                    // if the opposing player does not have enough cards to hit value >= 5,
                    //  they give up all of their cards in play
                    console.log("Switch case passed");
                    requestIndividualMoney(5);
                    playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                    playedPile.push(card);
                    playerObj.playsRemaining -= 1;
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
                        playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                        playedPile.push(card);
                        playerObj.playsRemaining -= 1;
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
                        playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                        playedPile.push(card);
                        playerObj.playsRemaining -= 1;
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
                        playerObj.playsRemaining -= 1;
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
                        playerObj.playsRemaining -= 1;
                        // ask player to choose from a list of their full properties
                        // player chooses a full property
                        // server applies house to it and removes house from their hand
                        // if "cancel" or something else is sent, card is not played
                    }
                    break;
                case "itsMyBirthday":
                    // ask each player to choose cards from their money pile/properties with total value >= 2
                    // if a player doesn't have enough to hit 2, automatically take all their played cards
                    playerObj.pendingActions += players.length - 1;
                    requestAllMoney(2);
                    playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                    playedPile.push(card);
                    playerObj.playsRemaining -= 1;
                    break;
                case "passGo":
                    if (deck.length < 2) {
                        deck = deck.concat(shuffle(playedPile));
                    }
                    playerObj.hand = playerObj.hand.concat(dc.drawCard(2, deck));
                    playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                    playedPile.push(card);
                    playerObj.playsRemaining -= 1;
                    break;
                default:
                    // double rent and just say no will cause this since these
                    //  can only be played under certain conditions
                    // warning message here
                    socket.emit("receive_alert_message", "Cannot play this card on its own");
                    break;
            } 
        } else if (card.type === "rent") {
            // get a list of all colours in the card that the player has properties for
            const validColours = card.colours.filter((c) => playerObj.properties.filter((p) => p.colour === c).length !== 0);
            console.log(validColours);
            if (validColours.length === 0) {
                socket.emit("receive_alert_message", "You do not have properties for this rent card.");
            } else {
                if (card.victims === "all") {
                    socket.emit("receive_multirent_1", validColours);
                } else {
                    socket.emit("receive_singlerent_1", {
                        colours: validColours,
                        plrList: players
                    });
                }
                playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
                playedPile.push(card);
                playerObj.playsRemaining -= 1;
            }
        } else if (card.type === "wildproperty") {
            console.log("wild property");
            socket.emit("receive_wildproperty_1", {
                colours: card.colours,
                card: card
            });
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
            playerObj.playsRemaining -= 1;
        } else {
            socket.emit("receive_alert_message", "How did this happen?");
        }
        socket.emit("receive_hand", playerObj.hand); // update the player's hand after playing
        updateClients();
    }

    function playCardAsMoney(card) {
        card.type = "money";
        playCard(card);
    }

    // gets the total money a player has in their money pile + properties
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

    // used for cards which ask a user to pick another user to take money from
    function requestIndividualMoney(amt) {
        socket.emit("receive_takemoney_1", {
            plrList: players.filter((p) => p.id !== socket.id),
            amt: amt
        });
    }

    function requestAllMoney(amt) {
        players.forEach((plr) => {
            if (plr.id !== socket.id) {
                const victimObj = players.find((p) => p.id === plr.id);
                io.to(plr.id).emit("receive_takemoney_3", {
                    victimObj: victimObj,
                    playerId: socket.id,
                    amt: amt
                });
            }
        })
    }

    function startGame() {
        turnOrder = [...players];
        // extremely basic shuffling "algorithm" which just swaps
        //  the positions of two random values in the array 35 times
        //  copied from generateDeck (don't want to make a full js file for this since it's used twice)
        for (let i = 0 ; i < 35 ; i++) {
            const rand1 = Math.floor(Math.random() * turnOrder.length);
            const rand2 = Math.floor(Math.random() * turnOrder.length);
            const temp = turnOrder[rand1];
            turnOrder[rand1] = turnOrder[rand2];
            turnOrder[rand2] = temp;
        }
        console.log(turnOrder);
        deck = gd.generateDeck();
        players.forEach((p) => {
            p.hand = dc.drawCard(5, deck);
            io.to(p.id).emit("receive_new_hand", {
                hand: p.hand
            });
        });
        currentTurn = 0;
        players.find((p) => p.id === turnOrder[currentTurn].id).turn = true;
        gameActive = true;
        startTurn();
    }

    function startTurn() {
        let playerObj = players.find((p) => p.id === turnOrder[currentTurn].id);
        playerObj.playsRemaining = 3;
        if (deck.length < 2) {
            deck = deck.concat(shuffle(playedPile));
            playedPile = [];
        }
        const newCards = dc.drawCard(2, deck);
        playerObj.hand = playerObj.hand.concat(newCards);
        io.to(playerObj.id).emit("receive_hand", playerObj.hand);
        io.to(playerObj.id).emit("receive_alert_message", "It is your turn.");
        updateClients();
    }

    function endTurn() {
        let playerObj = players.find((p) => p.id === turnOrder[currentTurn].id);
        if (playerObj.pendingActions > 0) {
            io.to(playerObj.id).emit("receive_alert_message", "Wait for the other player(s) to respond to your previous play.");
            return;
        }
        playerObj.turn = false;
        currentTurn++;
        if (currentTurn >= players.length) {
            currentTurn = 0;
        }
        players.find((p) => p.id === turnOrder[currentTurn].id).turn = true;
        startTurn();
    }

    function updateClients() {
        const winner = checkForWinner();
        if (winner) {
            gameActive = false;
            players.forEach((plr) => {
                io.to(plr.id).emit("receive_alert_message", winner.username + "has won!");
            });
        }
        players.forEach((plr) => {
            io.to(plr.id).emit("receive_client_update", {
                otherPlayers: players.filter((p) => p.id !== plr.id),
                playerData: players.find((p) => p.id === plr.id)
            });
        });
    }

    function checkForWinner() {
        let winner = false;
        players.forEach((plr) => {
            const uniqueFullSets = plr.properties.filter((p) => p.rent.length === p.cards.length && p.internalId === 0);
            if (uniqueFullSets.length === 3) {
                winner = plr;
            }
        });
        return winner;
    }

    function shuffle(d) {
        for (let i = 0 ; i < 200 ; i++) {
            const rand1 = Math.floor(Math.random() * d.length);
            const rand2 = Math.floor(Math.random() * d.length);
            const temp = deck[rand1];
            d[rand1] = d[rand2];
            d[rand2] = temp;
        }
        return d;
    }
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});