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

let deck = ["empty"];
let playedPile = [];
let players = [];

// convention for events:
//  "send_x": client sends x data
//  "receive_x": client receives x data
//  "request_x": client asks for x data (not sending any)

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    players.push({
        id: socket.id,
        hand: []
    });

    socket.on("send_message", (data) => {
        socket.emit("receive_message", data);
    });

    socket.on("create_game", () => {
        deck = gd.generateDeck();
        socket.emit("game_start", deck);
        console.log("Generated deck");
    });

    socket.on("draw_hand", (data) => {
        let playerObj = players.find((p) => p.id === socket.id)
        playerObj.hand = dc.drawCard(5, deck);
        socket.emit("view_hand", {
            hand: playerObj.hand,
            deck: deck
        });
    });

    socket.on("request_hand", (data) => {
        let playerObj = players.find((p) => p.id === socket.id)
        socket.emit("receive_hand", playerObj.hand);
    });

});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});