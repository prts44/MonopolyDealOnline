module.exports = {
    drawCard(amount, deck) {
        let draws = [];
        if (amount <= deck.length) {
            for (let i = 0 ; i < amount ; i++) {
                draws.push(deck.shift());
            }
            return draws;
        } else {
            return false;
        }
    },
    // testing function
    // allows me to draw a specific card from the deck ("tutor" is the term used for this in some card games)
    tutorCard(id, deck) {
        if (deck.filter((c) => c.internalId === parseInt(id)).length > 0) {
            return deck.find((c) => c.internalId === parseInt(id));
        } else {
            return false;
        }
    }
}