const { propertyCards } = require("./cardInfo");

module.exports = {
    // returns a new array with the given property cards added to it
    addProps(arr, props) {
        let newArr = [...arr];
        props.forEach((card) => {
            // if the player does is missing a non-full property set for this colour
            if (newArr.filter((propSet) => propSet.colour === card.colour && propSet.cards.length < propSet.rent.length).length === 0) {
                const intId = newArr.filter((p) => p.colour === card.colour).length; // used to differentiate different sets of the same colour
                newArr.push({
                    colour: card.colour,
                    cards: [card],
                    rent: card.rent,
                    house: false,
                    hotel: false,
                    internalId: intId
                });
            } else {
                newArr[newArr.findIndex((p) => p.colour === card.colour && p.cards.length < p.rent.length)].cards.push(card);
            }
        });
        return newArr;
    },
    // returns a new array with the given property cards removed
    removeProps(arr, props) {
        // for each card, filter each property set to remove the card (eventually)
        // somewhat inefficient but shouldnt do that many operations on average
        props.forEach((card) => {
            arr.map((p) => console.log("a"));
            arr.map(p => {
                console.log(p.cards.filter((c) => c.internalId !== card.internalId));
                p.cards = p.cards.filter((c) => c.internalId !== card.internalId);
            });
            console.log(arr); 
        });

        return arr;
    },
    // checks if a player has any properties
    hasProps(player) {
        let hasProps = false;
        // TODO: Make this not a forEach so it can break out once a property is found
        player.properties.forEach((p) =>{
            console.log(p);
            if (p.cards.length > 0) {
                hasProps = true;
            }
        });
        return hasProps;
    },
    // returns all of a player's full property sets (empty array if none)
    getFullProps(player) {

    },
    // calculates the rent value of a property set
    calcRent(props) {
        if (props.cards.length === 0) {
            console.log("ERROR: Propset has no cards.");
            return false;
        }
        let finalRent = props.rent[props.cards.length - 1];
        if (props.house === true) {
            finalRent += 3;
        }
        if (props.hotel === true) {
            finalRent += 4;
        }
        return finalRent;
    },
    // returns the rent array for a specific colour
    // used for wild properties
    getRentFromColour(colour) {
        return propertyCards.find((c) => c.colour === colour).rent;
    }
}