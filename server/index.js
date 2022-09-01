// adapted from this tutorial:
// https://www.youtube.com/watch?v=djMy4QsPWiI&ab_channel=PedroTech
const gd = require('./generateDeck');
const dc = require('./drawCard');
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
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

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    players.push({
        id: socket.id,
        hand: [],
        properties: [],
        moneyPile: [],
        money: 0,
        playsRemaining: 0,
        turn: false,
        confirmedAction: true // used for cards which require another player to choose e.g. Forced Deal
    });

    socket.on("send_play_card", (card) => {
        console.log("Server received data");
        playCard(card);
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

    // i would prefer to not have this function here but this
    //  is the only way i can think of to have cards played
    //  interact with the game state and get the correct player
    function playCard(card) {
        console.log("playCard running");
        let playerObj = players.find((p) => p.id === socket.id);
        if (card.type === "money") {
            console.log("Type check passed");
            playerObj.moneyPile.push(card);
            playerObj.hand = playerObj.hand.filter((c) => c.internalId !== card.internalId);
            playerObj.money += card.value;
        }
        socket.emit("receive_hand", playerObj.hand); // update the player's hand after playing
    }
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});