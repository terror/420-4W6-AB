const firstName = "Liam";
const numberOfSiblings = 2;
const doesLikePizza = true;
const person = {
    firstName,
    numberOfSiblings,
    doesLikePizza
};
console.log(JSON.stringify(person, null, "\t"));
