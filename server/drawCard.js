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
    }
}