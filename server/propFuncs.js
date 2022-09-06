module.exports = {
    // returns a new array with the given property cards added to it
    addProps(arr, props) {
        let newArr = [...arr];
        props.forEach((card) => {
            // if the player does not have a property set with this colour yet
            if (newArr.filter((propSet) => propSet.colour === card.colour).length === 0) {
                newArr.push({
                    colour: card.colour,
                    cards: [card],
                    rent: card.rent,
                    house: false,
                    hotel: false
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

    }
}