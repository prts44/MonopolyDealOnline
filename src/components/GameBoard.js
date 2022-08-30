import { useState, useEffect, useRef } from 'react';
import generateDeck from '.././func/generateDeck.js';

function GameBoard(props) {

    const [deck, setDeck] = useState(null);
    const [hand, setHand] = useState(null);

    useEffect(() => {
        console.log("test");
        setDeck(generateDeck());
    }, []);

    useEffect(() => {
        console.log(deck);
    }, [deck]);

    return (
        <div>
            <p>Test</p>
        </div>
    )
}

export default GameBoard;