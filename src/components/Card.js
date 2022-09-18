import style from '../styles/card.module.css';

// generates the display of a card given a card object
function Card(props) {
    if (props.card.type) {
        if (props.card.type === "money") {
            return (<span>
                <input disabled={props.disabled} className={style.radioButton} type="radio" value={props.card} name="hand" id={props.card.internalId} onClick={() => {props.callback(props.card)}}/>
                <label className={style.card} htmlFor={props.card.internalId}>Type: {props.card.type}<br/>Value: {props.card.value}</label>
            </span>);
        } else if (props.card.type === "renta") {

        } else if (props.card.type === "wildproperty") {
            return (<span>
                <input disabled={props.disabled} className={style.radioButton} type="radio" value={props.card} name="hand" id={props.card.internalId} onClick={() => {props.callback(props.card)}}/>
                <label className={style.card} htmlFor={props.card.internalId}><p style={{backgroundColor: props.card.colours[0], color: props.card.colours[0]}}>a</p><p style={{backgroundColor: props.card.colours[1], color: props.card.colours[1]}}>a</p>Wild Property<br/>Value: {props.card.value}</label>
            </span>);
        } else if (props.card.type === "property") {
            let cardName = "N/A";
            if (props.card.name) {
                console.log(props.card.name);
                cardName = props.card.name;
            }
            return (<span>
                <input disabled={props.disabled} className={style.radioButton} type="radio" value={props.card} name="hand" id={props.card.internalId} onClick={() => {props.callback(props.card)}}/>
                <label className={style.card} htmlFor={props.card.internalId}><p style={{backgroundColor: props.card.colour}}>{cardName}</p><br/>Value: {props.card.value}<br/>{props.card.rent.map((r) => <p>{r}</p>)}</label>
            </span>);
        } else {
            let cardName = "N/A";
            if (props.card.name) {
                console.log(props.card.name);
                cardName = props.card.name;
            }
            return (<span>
                <input disabled={props.disabled} className={style.radioButton} type="radio" value={props.card} name="hand" id={props.card.internalId} onClick={() => {props.callback(props.card)}}/>
                <label className={style.card} htmlFor={props.card.internalId}>{cardName}<br/>Type: {props.card.type}<br/>Value: {props.card.value}</label>
            </span>);
        }
    }
    return false;
}

Card.defaultProps = {
    disabled: false
}

export default Card;