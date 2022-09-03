module.exports = {
    // takes the money pile of a player and returns a new one with the given cards added
    addMoney(arr, cards) {
        let newArr = [...arr];
        cards.forEach((card) => {
            // if the player does not have a property set with this colour yet
            newArr.push(card);
        });
        return newArr;
    },
    // takes the money pile of a player and returns a new one with the given cards removed
    removeMoney(arr, cards) {
        let newArr = [...arr];
        cards.forEach((card) => {
            // if the player does not have a property set with this colour yet
            newArr = newArr.filter((c) => c.internalId !== card.internalId);
        });
        return newArr;
    }
}