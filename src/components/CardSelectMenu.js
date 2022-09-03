import { useEffect, useState, useRef } from 'react';

// takes a player object and creates a set of checkboxes
//  of their played cards and properties
// callback function should do something with all selected cards
function SelectionMenu(props) {

    const [propDisplay, setPropDisplay] = useState(<></>);
    const [moneyDisplay, setMoneyDisplay] = useState(<></>);
    
    const key = useRef(0);
    const selectedProps = useRef([]);
    const selectedMoney = useRef([]);

    useEffect(() => {
        // puts all played property cards into one array
        let allProps = [];
        props.plr.properties.map((p) => {
            p.cards.forEach((card) => {
                allProps.push(card);
            });
        });
        console.log(allProps);
        try {
            let pd = allProps.map((card) => {
                return (<span>
                    <input 
                        type="checkbox" 
                        value={card} 
                        name={card.internalId}
                        id={card.internalId} 
                        onChange={(e) => {
                            if (e.target.checked) {
                                selectedProps.current.push(card);
                            } else {
                                selectedProps.current = selectedProps.current.filter((c) => c.internalId !== card.internalId);
                            }
                        }}
                    />
                    <label htmlFor={card.internalId}>{card.internalId}</label>
                </span>);
            });
            setPropDisplay(pd); 
            let md = props.plr.moneyPile.map((card) => {
                return (<span>
                    <input 
                        type="checkbox" 
                        value={card} 
                        name={card.internalId}
                        id={card.internalId} 
                        onChange={(e) => {
                            if (e.target.checked) {
                                selectedMoney.current.push(card);
                            } else {
                                selectedMoney.current = selectedMoney.current.filter((c) => c.internalId !== card.internalId);
                            }
                        }}
                    />
                    <label htmlFor={card.internalId}>{card.internalId}</label>
                </span>);
            });
            setMoneyDisplay(md);
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
    }, []);

    return (
        <>
            {propDisplay}
            {moneyDisplay}
            <button onClick={() => {
                console.log(selectedProps.current);
                console.log(selectedMoney.current);
                props.callback({
                    props: selectedProps.current,
                    money: selectedMoney.current
                });
            }}>Select</button>
        </>
    )
}

export default SelectionMenu;