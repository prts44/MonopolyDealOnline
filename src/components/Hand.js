import { useEffect, useState } from 'react';

function Hand(props) {

    const [handDisplay, setHandDisplay] = useState(<p>Test</p>);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        try {
            let d = props.cards.map((card) => {
                return (<>
                    <input type="radio" value={card} name="hand" id={card.internalId} onClick={() => {setSelectedCard(card)}}/>
                    <label htmlFor={card.internalId}>ID: {card.internalId} | Type: {card.type}</label>
                </>);
            });
            setHandDisplay(d); 
        } catch (error) {
            console.log(error);
        }
    }, [props.cards]);

    return (
        <div>
            {handDisplay}
            <button onClick={() => {
                props.callback(selectedCard);
                console.log("Play button clicked");
            }}>Play card</button>
        </div>
    )
}   

export default Hand;