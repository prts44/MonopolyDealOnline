import CardSelectMenu from './components/CardSelectMenu.js';
import SelectionMenu from './components/SelectionMenu.js';
import PlayerDisplay from './components/PlayerDisplay.js';
import Hand from './components/Hand.js';
import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './styles/Game.module.css';

const socket = io.connect("http://localhost:3001");

function Game(props) {

    // i don't like having all these functions in the main App.js file
    //  but they have to be here as the "parent" for all other components

    const [hand, setHand] = useState([]);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [otherPlayersDisplay, setOtherPlayersDisplay] = useState([]);
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    const [popupContent, setPopupContent] = useState(null);
    const username = useRef(props.username);

    // does not actually play the card, just tells the server 
    //  what card the user is trying to play and lets it handle it
    function playCard(card) {
        console.log("Callback function reached");
        if (checkCardExists(card)) {
            console.log("Validity check passed");
            socket.emit("send_play_card", card);
        } else {
            console.log("Invalid play");
        }
    }

    function playCardAsMoney(card) {
        if (checkCardExists(card) && (card.type === "property" || card.type === "wildproperty")) {
            console.log("Invalid play");
        } else {
            socket.emit("send_play_card_as_money", card);
        }
    }

    // ensures the client does not send a null card (no card)
    function checkCardExists(card) {
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
        // if anyone knows a better way of doing this please tell me
        setOtherPlayersDisplay(otherPlayers.map((p) => {
            return <PlayerDisplay player={p}/>;
        }));
        console.log(otherPlayers.map((p) => {
            return <PlayerDisplay player={p}/>;
        }));
    }, [otherPlayers]);

    useEffect(() => {
        socket.on("receive_new_deck", (data) => {
            console.log(data);
        });

        socket.on("receive_new_hand", (data) => {
            console.log(data.hand);
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

        socket.on("receive_play_card", () => {
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
            console.log(gameState);
        });

        socket.on("receive_dealbreaker_1", (plrList) => {
            console.log(plrList);
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

        socket.on("receive_dealbreaker_3", (items) => {
            socket.emit("send_dealbreaker_4", {
                receiverId: items.receiverId,
                colour: items.colour,
                victimId: items.victimId
            });
        });

        socket.on("receive_takemoney_1", (items) => {
            setPopupContent(<div key={"TakeMoneyPlayerSelect"}><SelectionMenu 
                items={items.plrList.map((p) => {
                    return {
                        item: p,
                        label: p.id
                    }})}
                callback={(plr) => {
                    console.log("Callback triggered");
                    socket.emit("send_takemoney_2", {
                        id: plr.id,
                        amt: items.amt
                    });
                    closeModal();}}
                /></div>);
        });

        socket.on("receive_takemoney_3", (items) => {
            if (items.victimObj.money <= items.amt) {
                alert("You had to pay all your cards!");
                socket.emit("send_takemoney_4", {
                    // props looks like a mess but basically it just gets all property cards with > 0 value (excludes "all" wild property)
                    props: [].concat(items.victimObj.properties.map((p) => {return p.cards})).flat().filter((c) => c.value > 0),
                    money: items.victimObj.moneyPile,
                    playerId: items.playerId
                });
            } else {
                alert("Pick which cards to give away");
                setPopupContent(<div key={"DCCardSelect"}>
                    <CardSelectMenu plr={items.victimObj} callback={(cards) => {
                        let totalValue = 0;
                        cards.money.forEach((card) => {
                            totalValue += card.value;
                        });
                        cards.props.forEach((card) => {
                            totalValue += card.value;
                        });
                        if (totalValue >= 5) {
                            socket.emit("send_takemoney_4", {
                                props: cards.props,
                                money: cards.money,
                                playerId: items.playerId
                            });
                            closeModal();
                        } else {
                            alert("Please select at least $" + items.amt + " worth of value in cards");
                        }
                    }}/>
                </div>);
            }
        });

        socket.on("receive_forceddeal_1", (data) => {
            let rtn = {
                victimId: null,
                taken: null,
                given: null
            };
            setPopupContent(<div key={"FDPickPlr"}><SelectionMenu 
                items={data.plrList.map((p) => {
                    return {
                        item: p,
                        label: p.id
                    }})}
                callback={(plr) => {
                    console.log("Callback triggered");
                    rtn.victimId = plr.id;
                    setPopupContent(<div key={"FDPickPropTake"}><CardSelectMenu
                        plr={plr}
                        displayMoney={false}
                        callback={(cards) => {
                            if (cards.props.length === 1) {
                                rtn.taken = cards.props[0];
                                setPopupContent(<div key={"FDPickPropGive"}><CardSelectMenu
                                    plr={data.playerObj}
                                    displayMoney={false}
                                    callback={(cards) => {
                                        if (cards.props.length === 1) {
                                            rtn.given = cards.props[0];
                                            socket.emit("send_forceddeal_2", rtn);
                                            closeModal();
                                        } else {
                                            alert("Please select only one property");
                                        }
                                    }}
                                /></div>);
                            } else {
                                alert("Please select only one property");
                            }
                        }}
                    /></div>);
                }}/></div>);
        });

        socket.on("receive_forceddeal_3", (items) => {
            socket.emit("send_forceddeal_4", {
                victimId: items.victimId,
                receiverId: items.receiverId,
                taken: items.taken,
                given: items.given
            });
        });

        socket.on("receive_slydeal_1", (data) => {
            let rtn = {
                victimId: null,
                taken: null
            };
            setPopupContent(<div key={"SDPickPlr"}><SelectionMenu 
                items={data.plrList.map((p) => {
                    return {
                        item: p,
                        label: p.id
                    }})}
                callback={(plr) => {
                    console.log("Callback triggered");
                    rtn.victimId = plr.id;
                    setPopupContent(<div key={"SDPickPropTake"}><CardSelectMenu
                        plr={plr}
                        displayMoney={false}
                        callback={(cards) => {
                            if (cards.props.length === 1) {
                                if (cards.props.length === 1) {
                                    rtn.taken = cards.props[0];
                                    socket.emit("send_slydeal_2", rtn);
                                    closeModal();
                                } else {
                                    alert("Please select only one property");
                                }
                            } else {
                                alert("Please select only one property");
                            }
                        }}
                    /></div>);
                }}/></div>);
        });

        socket.on("receive_slydeal_3", (items) => {
            socket.emit("send_slydeal_4", {
                victimId: items.victimId,
                receiverId: items.receiverId,
                taken: items.taken,
            });
        });

        socket.on("receive_house_1", (fullProps) => {
            setPopupContent(<div key={"HousePickSet"}><SelectionMenu 
                items={fullProps.map((p) => {
                    return {
                        item: p,
                        label: p.colour
                    }})}
                callback={(prop) => {
                    socket.emit("send_house_2", prop.colour);    
                    closeModal();
                }}/></div>);
        });

        socket.on("receive_hotel_1", (fullPropsWithHouse) => {
            setPopupContent(<div key={"HotelPickSet"}><SelectionMenu 
                items={fullPropsWithHouse.map((p) => {
                    return {
                        item: p,
                        label: p.colour
                    }})}
                callback={(prop) => {
                    socket.emit("send_hotel_2", prop.colour);    
                    closeModal();
                }}/></div>);
        });

        socket.on("receive_singlerent_1", (items) => {
            setPopupContent(<div key={"SRentPickColour"}><SelectionMenu 
                items={items.colours.map((c) => {
                    return {
                        item: c,
                        label: c
                    }})}
                callback={(c) => {
                    socket.emit("send_singlerent_2", c);    
                    closeModal();
                }}/></div>);
        });

        socket.on("receive_multirent_1", (colours) => {
            setPopupContent(<div key={"MRentPickColour"}><SelectionMenu 
                items={colours.map((c) => {
                    return {
                        item: c,
                        label: c
                    }})}
                callback={(c) => {
                    socket.emit("send_multirent_2", c);    
                    closeModal();
                }}/></div>);
        });

        // the victim of the action card played will receive this event
        socket.on("receive_justsayno_1", (items) => {
            alert("JSN event worked");
            console.log(items.cards);
            console.log(items.callback);
            setPopupContent(<div key={"JSNPickCard"}><SelectionMenu 
                cancelButton={true}
                items={items.cards.map((c) => {
                    return {
                        item: c,
                        label: "Just Say No"
                    }})}
                callback={(c) => {
                    console.log(items.noCount);
                    if (c !== null) {
                        socket.emit("send_justsayno_2", {
                            nextEvent: items.nextEvent,
                            starterId: items.starterId,
                            nextReceiverId: items.nextReceiverId,
                            noCount: items.noCount + 1,
                            card: c
                        });
                    } else if (items.noCount % 2 === 0){
                        console.log("Even # of JSNs played; proceed with event");
                        socket.emit("request_emit_event_from_server", items.nextEvent[0], items.nextEvent[1]);
                    } else {
                        console.log("Odd # of JSNs played; proceed with event");
                        alert("The other player said no!");
                    }
                    closeModal();
                }}/></div>);
        });

        // these are double rent events
        // yes, they are the exact same
        // i hate it just as much as you don't worry
        socket.on("receive_multirent_3", (items) => {
            let mult = 1;
            setPopupContent(<div key={"MultiDoubleRent"}><SelectionMenu 
                cancelButton={true}
                items={items.cards.map((c) => {
                    return {
                        item: c,
                        label: "Double Rent"
                    }})}
                callback={(c) => {
                    if (c !== null) {
                        mult = 2;
                    } 
                    socket.emit("send_multirent_4", {
                        colour: items.colour,
                        mult: mult,
                        drCard: c
                    });
                    closeModal();
                }}/></div>);
        });

        socket.on("receive_singlerent_3", (items) => {
            let mult = 1;
            setPopupContent(<div key={"SingleDoubleRent"}><SelectionMenu 
                cancelButton={true}
                items={items.cards.map((c) => {
                    return {
                        item: c,
                        label: "Double Rent"
                    }})}
                callback={(c) => {
                    if (c !== null) {
                        mult = 2;
                    } 
                    socket.emit("send_singlerent_4", {
                        colour: items.colour,
                        mult: mult,
                        drCard: c
                    });
                    closeModal();
                }}/></div>);
        });

        socket.on("receive_wildproperty_1", (items) => {
            setPopupContent(<div key={"WPColourPicker"}><SelectionMenu 
                items={items.colours.map((c) => {
                    return {
                        item: c,
                        label: c
                    }})}
                callback={(c) => {
                    socket.emit("send_wildproperty_2", {
                        colour: c,
                        card: items.card
                    });    
                    closeModal();
                }}/></div>);
        });

        socket.on("receive_client_update", (items) => {
            // will update all other playerdata when the server says to
            setOtherPlayers(items.otherPlayers);
        });

        socket.emit("request_enter_game", username.current);

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
    }, []);

    if (props.username == null) {
        return <Navigate to="/" replace/>
    } else {
        return (
            <div id="mainDiv" className={style.container}>
                <div id="otherPlayers" className={style.playerDisplay}>
                    {otherPlayersDisplay}
                </div>
                <div id="div1">
                    <button onClick={() => {socket.emit("request_hand");}}>See your hand</button>
                    <button onClick={() => {socket.emit("request_money");}}>See your money</button>
                    <button onClick={() => {socket.emit("request_money_pile");}}>See your money pile</button>
                    <button onClick={() => {socket.emit("request_properties");}}>See your properties</button>
                    <button onClick={() => {socket.emit("request_start_game");}}>Start game</button>
                    <button onClick={() => {socket.emit("request_end_turn");}}>End turn</button>
                </div>
                <Hand cards={hand} callback={playCard} callback2={playCardAsMoney}/>
                <Popup open={open} closeOnDocumentClick={false} onClose={closeModal}>
                    <div className="modal">
                        {popupContent}
                    </div>
                </Popup>
            </div>
        );
    }
}

export default Game;