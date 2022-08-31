import GameBoard from './components/GameBoard.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {

    useEffect(() => {
        socket.on("game_start", (data) => {
            console.log(data);
            //setDisplay(data[0].type);
            //console.log(display);
        });
        socket.on("view_hand", (data) => {
            console.log(data.hand);
            console.log(data.deck);
        });
        socket.on("receive_hand", (data) => {
            console.log(data);
        });
        socket.on("receive_card_draw", (data) => {
            console.log(data);
        });
        socket.on("receive_deck", (data) => {
            console.log(data);
        });
        return () => {
            socket.off("game_start");
            socket.off("view_hand");
            socket.off("receive_hand");
            socket.off("receive_card_draw");
            socket.off("receive_deck");
        }
    }, [socket]);

    return (
        <div id="mainDiv">
            <GameBoard />
            <div id="div1">
                <button onClick={() => {socket.emit("create_game");}}>Generate new deck</button>
                <button onClick={() => {socket.emit("request_deck");}}>See the full deck</button>
                <button onClick={() => {socket.emit("draw_hand");}}>Deal starting hand</button>
                <button onClick={() => {socket.emit("request_hand");}}>See your hand</button>
                <button onClick={() => {socket.emit("request_card_draw");}}>Draw a card</button>
            </div>
            
        </div>
    );
}

export default App;
