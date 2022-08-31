import GameBoard from './components/GameBoard.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {

    const [message, setMessage] = useState("");
    const [game, setGame] = useState();

    function createGame() {
        socket.emit("create_game");
    }

    function drawHand() {
        socket.emit("draw_hand");
    }

    /*useEffect(() => {
        socket.on("receive_message", (data) => {
            alert(data.message);
        });
    }, [socket]);*/

    useEffect(() => {
        socket.on("game_start", (data) => {
            console.log(data);
        });
        socket.on("view_hand", (data) => {
            console.log(data.hand);
            console.log(data.deck);
        });
    }, [socket]);

    return (
        <div id="mainDiv">
            <GameBoard />
            <div id="div1">
                <input placeholder="Message" onChange={(e) => {
                    setMessage(e.target.value);
                }}></input>
                <button onClick={createGame}>Start Game</button>
                <button onClick={drawHand}>Deal starting hand</button>
            </div>
        </div>
    );
}

export default App;
