import GameBoard from './components/GameBoard.js';
import Hand from './components/Hand.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {

    const [hand, setHand] = useState([]);

    useEffect(() => {
        socket.on("receive_new_deck", (data) => {
            console.log(data);
        });
        socket.on("receive_new_hand", (data) => {
            console.log(data.hand);
            console.log(data.deck);
            setHand(data.hand);
        });
        socket.on("receive_hand", (data) => {
            console.log(data);
            setHand(data);
        });
        socket.on("receive_card_draw", (data) => {
            console.log(data.newCard);
            setHand(data.hand);
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
                <h4>These are testing buttons, the game will not work like this</h4>
                <button onClick={() => {socket.emit("request_new_deck");}}>Generate new deck</button>
                <button onClick={() => {socket.emit("request_deck");}}>See the full deck</button>
                <button onClick={() => {socket.emit("request_new_hand");}}>Deal starting hand</button>
                <button onClick={() => {socket.emit("request_hand");}}>See your hand</button>
                <button onClick={() => {socket.emit("request_card_draw");}}>Draw a card</button>
                <button onClick={() => {socket.emit("request_turn");}}>Make it your turn</button>
            </div>
            <Hand cards={hand}/>
        </div>
    );
}

export default App;
