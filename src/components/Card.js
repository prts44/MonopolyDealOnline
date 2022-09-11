import style from '../styles/card.module.css';

// generates the display of a card given a card object
function Card(props) {
    if (props.card.type) {
        if (props.card.type === "moneya") {

        } else if (props.card.type === "renta") {

        } else if (props.card.type === "wildpropertya") {
        
        } else if (props.card.type === "property") {
                
        } else {
            let cardName = "N/A";
            if (props.card.name) {
                console.log(props.card.name);
                cardName = props.card.name;
            }
            return (<div>
                <input className={style.radioButton} type="radio" value={props.card} name="hand" id={props.card.internalId} onClick={() => {props.callback(props.card)}}/>
                <label className={style.card} htmlFor={props.card.internalId}>{cardName}<br/>Type: {props.card.type}</label>
            </div>);
        }
    }
}

export default Card;