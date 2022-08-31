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

let deck = gd.generateDeck();
let playedPile = [];

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data);
    });

    socket.on("create_game", (data) => {
        socket.broadcast.emit("game_start", deck);
    });

    socket.on("draw_hand", (data) => {
        socket.broadcast.emit("view_hand", {
            hand: dc.drawCard(5, deck),
            deck: deck
        });
    });

});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});