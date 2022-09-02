import GameBoard from './components/GameBoard.js';
import SelectionMenu from './components/SelectionMenu.js';
import Hand from './components/Hand.js';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';

const socket = io.connect("http://localhost:3001");

function App() {

    // i don't like having all these functions in the main App.js file
    //  but they have to be here as the "parent" for all other components

    const [hand, setHand] = useState([]);
    const [gameState, setGameState] = useState(null);
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    const [popupContent, setPopupContent] = useState(null);

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

    // requires the client to have game state, which isnt implemented yet
    // will otherwise do numerous checks to see if the play is valid
    function checkValidPlay(card) {
        if (card == null) {
            return false;
        } else {
            return true;
        }
    }

    useEffect(() => {
        console.log("Use effect triggered");
        if (popupContent !== null) {
            console.log("Set open triggered");
            closeModal();
            setOpen(true);
        }
    }, [popupContent]);

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

        socket.on("receive_alert_message", (msg) => {
            alert(msg);
        });

        socket.on("receive_game_state", (gameState) => {
            setGameState(gameState);
            console.log(gameState);
        });

        socket.on("receive_dealbreaker_1", (plrList) => {
            console.log(plrList);
            // absolutely disgusting confusing mess, but:
            //  all this does is set the popup to show the list of players
            //   with full properties to display on the selection popup
            //  then, once the user selects one, it sets the popup to show
            //   the player's full properties for the user to select
            //  once the user selects a property, the client sends the player
            //   and property chosen to the server for them to handle it
            setPopupContent(<div key={"DBPickPlr"}><SelectionMenu 
                items={plrList.map((p) => {
                    return {
                        item: p,
                        label: p.id
                    }})}
                callback={(plr) => {
                    console.log("Callback triggered");
                    const fullPlrProps = plr.properties.filter((p) => p.rent.length === p.cards.length);
                    setPopupContent(<div key={"DBPickProp"}><SelectionMenu
                        items={fullPlrProps.map((p) => {
                            return {
                                item: p,
                                label: p.colour
                            }
                        })}
                        callback={(p) => {
                            socket.emit("send_dealbreaker_2", {
                                colour: p.colour,
                                id: plr.id
                            });
                            closeModal();}}
                    /></div>);
                }}/></div>);
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
            socket.off("receive_game_state");
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
                <button onClick={() => {socket.emit("request_game_state");}}>See the current game state</button>
            </div>
            <Hand cards={hand} callback={playCard}/>
            <Popup open={open} closeOnDocumentClick={false} onClose={closeModal}>
                <div className="modal">
                    {popupContent}
                </div>
            </Popup>
        </div>
    );
}

export default App;
