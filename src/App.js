import GameBoard from './components/GameBoard.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {

    const [hand, setHand] = useState([]);

    function generateHandDisplay() {
        try {
            let handDisplay = hand.map((card) => {
                if (card.type === "money") {
                    return (<div>Money: {card.value}</div>);
                } else if (card.type === "action") {
                    return (<div>{card.name}</div>)
                } else if (card.type === "property") {
                    return (<div>
                        Property: {card.colour} | Rent: {card.rent[0]}
                    </div>)
                } else if (card.type === "wildproperty") {
                    return (<div>
                        Wildcard Property | Colours: {card.colours[0] + card.colours[1]}
                    </div>)
                } else if (card.type === "rent") {
                    return (<div>Rent</div>)
                }
            });
            return handDisplay; 
        } catch (error) {
            return <p>Hand empty</p>;
        }
    }

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
                <button onClick={() => {socket.emit("request_new_deck");}}>Generate new deck</button>
                <button onClick={() => {socket.emit("request_deck");}}>See the full deck</button>
                <button onClick={() => {socket.emit("request_new_hand");}}>Deal starting hand</button>
                <button onClick={() => {socket.emit("request_hand");}}>See your hand</button>
                <button onClick={() => {socket.emit("request_card_draw");}}>Draw a card</button>
            </div>
            <div id="hand">
                {generateHandDisplay()}
            </div>
        </div>
    );
}

export default App;
