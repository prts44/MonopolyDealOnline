import { useState, useEffect } from 'react';
import Card from './Card.js';
import style from '../styles/playerDisplay.module.css';

// info about another player shown to each client
function PlayerDisplay(props) {

    const [moneyPile, setMoneyPile] = useState(<></>);
    const [properties, setProperties] = useState(<></>);

    function generateMoneyPile() {
        let newMoneyPile = [];
        props.player.moneyPile.forEach((c) => {
            newMoneyPile.push(<Card disabled={true} card={c} callback={() => {}}/>);
        });
        setMoneyPile(newMoneyPile);
        console.log("Generated money pile");
        return;
    }

    function generateProperties() {
        let newPropsPile = [];
        props.player.properties.forEach((p) => {
            newPropsPile.push(<div>
                {p.cards.map((c) => {
                    return <Card disabled={true} card={c} callback={() => {}} />;
                })}
            </div>)
        });
        setProperties(newPropsPile);
        console.log("Generated properties piles");
        return;
    }

    useEffect(() => {
        generateMoneyPile();
        generateProperties();
    }, [props]);

    return (
        <div className={style.container}>
            <h3>{props.player.username}</h3>
            <div className={style.cardDisplay}>
                <div className={style.propsDisplay}>
                    {properties}
                </div>
                <div className={style.moneyDisplay}>
                    {moneyPile}
                </div>
            </div>
        </div>
    );

}

export default PlayerDisplay;