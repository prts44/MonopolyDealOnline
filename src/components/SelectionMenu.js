import { useEffect, useState, useRef } from 'react';

// takes an array of objects of the following form:
// {
//  item: whatever item you want to store (any type),
//  label: what you want to be displayed as the label (MUST BE SINGLE TYPE)
// }
// also requires a callback function when the button is clicked which
//  will always take in the value of the radio button chosen
function SelectionMenu(props) {

    const [display, setDisplay] = useState(<></>);
    const [selected, setSelected] = useState(null);
    const key = useRef(0);

    useEffect(() => {
        try {
            let d = props.items.map((item) => {
                return (<span>
                    <input type="radio" value={item.item} name="menu" id={item.label} onClick={() => {setSelected(item.item)}}/>
                    <label htmlFor={item.label}>{item.label}</label>
                </span>);
            });
            setDisplay(d); 
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
            {display}
            <button onClick={() => {props.callback(selected)}}>Select</button>
        </>
    )
}

export default SelectionMenu;