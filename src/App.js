import GameBoard from './components/GameBoard.js';
import Hand from './components/Hand.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {

    // i don't like having all these functions in the main App.js file
    //  but they have to be here as the "parent" for all other components

    const [hand, setHand] = useState([]);

    // does not actually play the card, just tells the server 
    //  what card the user is trying to play and lets it handle it
    function playCard(card) {
        console.log("Callback function reached");
        if (checkValidPlay(card)) {
            console.log("Validity check passed");
            socket.emit("send_play_card", card);
        } else {
            console.log("Invalid play");
        }
    }

    // requires the client to have game state, which isnt implemented yet; 
    //  will otherwise do numerous checks to see if the play is valid
    function checkValidPlay(card) {
        if (card == null) {
            return false;
        } else {
            return true;
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

        socket.on("receive_play_card", (data) => {
            console.log("Card successfully played");
        });

        socket.on("receive_money", (money) => {
            console.log(money);
        });
        
        socket.on("receive_money_pile", (moneyPile) => {
            console.log(moneyPile);
        });
        
        socket.on("receive_properties", (properties) => {
            console.log(properties);
        });

        return () => {
            socket.off("receive_new_deck");
            socket.off("receive_new_hand");
            socket.off("receive_hand");
            socket.off("receive_card_draw");
            socket.off("receive_deck");
            socket.off("receive_play_card");
            socket.off("receive_money");
            socket.off("receive_money_pile");
            socket.off("receive_properties");
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
                <button onClick={() => {socket.emit("request_money");}}>See your money</button>
                <button onClick={() => {socket.emit("request_money_pile");}}>See your money pile</button>
                <button onClick={() => {socket.emit("request_properties");}}>See your properties</button>
            </div>
            <Hand cards={hand} callback={playCard}/>
        </div>
    );
}

export default App;
