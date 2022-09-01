import { useEffect, useState, useRef } from 'react';

function Hand(props) {

    const [handDisplay, setHandDisplay] = useState(<p>Test</p>);
    const [selectedCard, setSelectedCard] = useState(null);
    const key = useRef(0);

    useEffect(() => {
        try {
            let d = props.cards.map((card) => {
                return (<span>
                    <input type="radio" value={card} name="hand" id={card.internalId} onClick={() => {setSelectedCard(card)}}/>
                    <label htmlFor={card.internalId}>ID: {card.internalId} | Type: {card.type}</label>
                </span>);
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
        <div key={key.current}>
            {handDisplay}
            <button onClick={() => {
                props.callback(selectedCard);
                setSelectedCard(null);
            }}>Play card</button>
        </div>
    )
}   

export default Hand;