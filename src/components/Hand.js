import { useEffect, useState, useRef } from 'react';
import style from '../styles/card.module.css';

function Hand(props) {

    const [handDisplay, setHandDisplay] = useState(<p>Test</p>);
    const [selectedCard, setSelectedCard] = useState(null);
    const key = useRef(0);

    function getCard(card) {
        if (card.type) {
            if (card.type === "moneya") {

            } else if (card.type === "renta") {

            } else if (card.type === "wildpropertya") {
                
            } else {
                let cardName = "N/A";
                if (card.name) {
                    console.log(card.name);
                    cardName = card.name;
                }
                return (<div>
                    <input className={style.radioButton} type="radio" value={card} name="hand" id={card.internalId} onClick={() => {setSelectedCard(card)}}/>
                    <label className={style.card} htmlFor={card.internalId}>{cardName}<br/>Type: {card.type}</label>
                </div>);
            }
        }
    }

    useEffect(() => {
        try {
            let d = props.cards.map((card) => {
                return getCard(card);
            });
            setHandDisplay(d); 
        } catch (error) {
            console.log(error);
        }
        // force resets all radio buttons on re-render by alternating the key of the container div between 0 and 1
        //  yes this is disgusting
        //  no i dont know a better way to do this
        key.current++;
        if (key.current === 2) {
            key.current = 0;
        }
    }, [props.cards]);

    return (
        <div className={style.hand} key={key.current}>
            {handDisplay}
            <button onClick={() => {
                props.callback(selectedCard);
                setSelectedCard(null);
            }}>Play card</button>
        </div>
    )
}   

export default Hand;