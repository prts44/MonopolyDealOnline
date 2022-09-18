// arrays for info on all types of cards
const actionCards = [
    {
        id: "dealBreaker",
        name: "Deal Breaker",
        qty: 2,
        value: 5
    },
    {
        id: "debtCollector",
        name: "Debt Collector",
        qty: 3,
        value: 3
    },
    {
        id: "doubleRent",
        name: "Double the Rent",
        qty: 2,
        value: 1
    },
    {
        id: "forcedDeal",
        name: "Forced Deal",
        qty: 2,
        value: 3
    },
    {
        id: "hotel",
        name: "Hotel",
        qty: 3,
        value: 4
    },
    {
        id: "house",
        name: "House",
        qty: 3,
        value: 3
    },
    {
        id: "itsMyBirthday",
        name: "It's My Birthday",
        qty: 3,
        value: 2
    },
    {
        id: "slyDeal",
        name: "Sly Deal",
        qty: 3,
        value: 3
    },
    {
        id: "passGo",
        name: "Pass Go",
        qty: 10,
        value: 1
    },
    {
        id: "justSayNo",
        name: "Just Say No",
        qty: 3,
        value: 4
    },
];

const propertyCards = [
    {
        colour: "brown",
        rent: [1, 2],
        qty: 2,
        canHouse: true,
        names: ["Baltic Avenue", "Mediterranean Avenue"],
        value: 1
    },
    {
        colour: "blue",
        rent: [3, 8],
        qty: 2,
        canHouse: true,
        names: ["Boardwalk", "Park Place"],
        value: 4
    },
    {
        colour: "green",
        rent: [2, 4, 7],
        qty: 3,
        canHouse: true,
        names: ["North Carolina Avenue", "Pacific Avenue", "Pennsylvania Avenue"],
        value: 4
    },
    {
        colour: "lightblue",
        rent: [1, 2, 3],
        qty: 3,
        canHouse: true,
        names: ["Connecticut Avenue", "Oriental Avenue", "Vermont Avenue"],
        value: 1
    },
    {
        colour: "orange",
        rent: [1, 3, 5],
        qty: 3,
        canHouse: true,
        names: ["New York Avenue", "St. James Place", "Tennessee Avenue"],
        value: 2
    },
    {
        colour: "purple",
        rent: [1, 2, 4],
        qty: 3,
        canHouse: true,
        names: ["St. Charles Place", "Virginia Avenue", "States Avenue"],
        value: 2
    },
    {
        colour: "black",
        rent: [1, 2, 3, 4],
        qty: 4,
        canHouse: false,
        names: ["Short Line", "B & O Railroad", "Reading Railroad", "Pennsylvania Railroad"],
        value: 2
    },
    {
        colour: "red",
        rent: [2, 3, 6],
        qty: 3,
        canHouse: true,
        names: ["Kentucky Avenue", "Indiana Avenue", "Illinois Avenue"],
        value: 3
    },
    {
        colour: "grey",
        rent: [1, 2],
        qty: 2,
        canHouse: false,
        names: ["Water Works", "Electric Company"],
        value: 2
    },
    {
        colour: "yellow",
        rent: [2, 4, 6],
        qty: 3,
        canHouse: true,
        names: ["Ventnor Avenue", "Marvin Gardens", "Atlantic Avenue"],
        value: 3
    },
];

const wildCards = [
    {
        colours: ["blue", "green"],
        qty: 1,
        victims: "all",
        value: 4
    },
    {
        colours: ["purple", "orange"],
        qty: 2,
        victims: "all",
        value: 2
    },
    {
        colours: ["lightblue", "brown"],
        qty: 1,
        victims: "all",
        value: 1
    },
    {
        colours: ["lightblue", "black"],
        qty: 1,
        victims: "all",
        value: 4
    },
    {
        colours: ["black", "green"],
        qty: 1,
        victims: "all",
        value: 4
    },
    {
        colours: ["red", "yellow"],
        qty: 2,
        victims: "all",
        value: 3
    },
    {
        colours: ["grey", "black"],
        qty: 1,
        victims: "all",
        value: 2
    },
    {
        colours: ["blue", "green", "purple", "orange", "lightblue", "red", "yellow", "black", "grey"],
        qty: 2,
        victims: "single",
        value: 0
    }
];

const rentCards = [
    {
        colours: ["blue", "green"],
        qty: 2,
        value: 1
    },
    {
        colours: ["purple", "orange"],
        qty: 2,
        value: 1
    },
    {
        colours: ["lightblue", "brown"],
        qty: 2,
        value: 1
    },
    {
        colours: ["red", "yellow"],
        qty: 2,
        value: 1
    },
    {
        colours: ["grey", "black"],
        qty: 2,
        value: 1
    },
    {
        colours: ["blue", "green", "purple", "orange", "lightblue", "red", "yellow", "black", "grey"],
        qty: 3,
        value: 3
    }
];

const moneyCards = [
    {
        value: 10,
        qty: 1
    },
    {
        value: 1,
        qty: 6
    },
    {
        value: 2,
        qty: 5
    },
    {
        value: 3,
        qty: 3
    },
    {
        value: 4,
        qty: 3
    },
    {
        value: 5,
        qty: 2
    },
];

module.exports = {
    actionCards: actionCards,
    propertyCards: propertyCards,
    wildCards: wildCards,
    rentCards: rentCards,
    moneyCards: moneyCards
}