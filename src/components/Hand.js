import { useEffect, useState } from 'react';

function Hand(props) {

    const [handDisplay, setHandDisplay] = useState(<p>Test</p>);

    useEffect(() => {
        console.log("b");
        try {
            let d = props.cards.map((card) => {
                return (<>
                    <input type="radio" value={card} name="hand" id={card.type}/>
                    <label htmlFor={card.type}>{card.type}</label>
                </>);
            });
            setHandDisplay(d); 
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <>{handDisplay}</>
    )
}   

export default Hand;