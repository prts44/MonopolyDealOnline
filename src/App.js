import GameBoard from './components/GameBoard.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {

    const [message, setMessage] = useState("");
    const [game, setGame] = useState();
    const [display, setDisplay] = useState("hey");

    function createGame() {
        socket.emit("create_game");
    }

    function drawHand() {
        socket.emit("draw_hand");
    }

    function getHand() {
        socket.emit("request_hand");
    }

    function drawCard() {
        socket.emit("request_card_draw");
    }

    /*useEffect(() => {
        socket.on("receive_message", (data) => {
            alert(data.message);
        });
    }, [socket]);*/

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
                <input placeholder="Message" onChange={(e) => {
                    setMessage(e.target.value);
                }}></input>
                <button onClick={createGame}>Generate new deck</button>
                <button onClick={() => {socket.emit("request_deck");}}>See the full deck</button>
                <button onClick={drawHand}>Deal starting hand</button>
                <button onClick={getHand}>See your hand</button>
                <button onClick={drawCard}>Draw a card</button>
            </div>
            
        </div>
    );
}

export default App;
