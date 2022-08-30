import { useState, useEffect, useRef } from 'react';
import generateDeck from '.././func/generateDeck.js';

function GameBoard(props) {

    const [deck, setDeck] = useState(null);

    useEffect(() => {
        console.log("test");
        setDeck(generateDeck());
    }, []);

    useEffect(() => {
        console.log(deck);
    }, [deck]);

    return (
        <p>Test</p>
    )
}

export default GameBoard;