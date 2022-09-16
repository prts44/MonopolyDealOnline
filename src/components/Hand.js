import { useEffect, useState, useRef } from 'react';
import style from '../styles/card.module.css';
import Card from './Card.js';

function Hand(props) {

    const [handDisplay, setHandDisplay] = useState(<p>Test</p>);
    const [selectedCard, setSelectedCard] = useState(null);
    const key = useRef(0);

    useEffect(() => {
        try {
            let d = props.cards.map((card) => {
                return <Card card={card} callback={(c) => {setSelectedCard(c);}}/>;
            });
            console.log(d);
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
            <button onClick={() => {
                props.callback2(selectedCard);
                setSelectedCard(null);
            }}>Play card as money</button>
        </div>
    )
}   

export default Hand;