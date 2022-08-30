import { useState, useEffect, useRef } from 'react';

function GameBoard(props) {

    const [deck, setDeck] = useState(null);
    const [hand, setHand] = useState(null);

    useEffect(() => {
        console.log("test");
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