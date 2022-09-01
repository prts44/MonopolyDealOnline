const cards = require('./cardInfo.js');

module.exports = {
    generateDeck() {

        // creates a deck based on cardInfo.js and shuffles it
        
        // honestly kind of a gross way of doing this but this function only runs once
        //  at the start of each game so it should be fine

        const deck = []; // blank array

        let internalId = 0; // used for displaying the card and determining which cards are which internally
        
        cards.actionCards.forEach((card) => {
            // put a certain amount of each card into the deck
            for (let i = 0 ; i < card.qty ; i++) {
                deck.push(
                    {  
                        id: card.id,
                        name: card.name,
                        type: "action",
                        internalId: internalId
                    }
                );
                internalId++;
            }
        });

        // following functions are all the same as actionCards but with different card parameters
        cards.propertyCards.forEach((card) => {
            for (let i = 0 ; i < card.qty ; i++) {
                deck.push(
                    {
                        colour: card.colour,
                        canHouse: card.canHouse,
                        rent: card.rent,
                        type: "property",
                        internalId: internalId
                    }
                );
                internalId++;
            }
        });

        cards.wildCards.forEach((card) => {
            for (let i = 0 ; i < card.qty ; i++) {
                deck.push(
                    {
                        colours: card.colours,
                        type: "wildproperty",
                        internalId: internalId
                    }
                );
                internalId++;
            }
        });

        cards.rentCards.forEach((card) => {
            for (let i = 0 ; i < card.qty ; i++) {
                deck.push(
                    {
                        colours: card.colours,
                        type: "rent",
                        internalId: internalId
                    }
                );
                internalId++;
            }
        });

        cards.moneyCards.forEach((card) => {
            for (let i = 0 ; i < card.qty ; i++) {
                deck.push(
                    {  
                        value: card.value,
                        type: "money",
                        internalId: internalId
                    }
                );
                internalId++;
            }
        });

        // extremely basic shuffling "algorithm" which just swaps
        //  the positions of two random values in the array 200 times
        for (let i = 0 ; i < 200 ; i++) {
            const rand1 = Math.floor(Math.random() * deck.length);
            const rand2 = Math.floor(Math.random() * deck.length);
            const temp = deck[rand1];
            deck[rand1] = deck[rand2];
            deck[rand2] = temp;
        }

        return deck;
    }
}