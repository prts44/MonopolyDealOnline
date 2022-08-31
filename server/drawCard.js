module.exports = {
    drawCard(amount, deck) {
        let hand = [];
        for (let i = 0 ; i < amount ; i++) {
            hand.push(deck.shift());
        }
        return hand;
    }
}