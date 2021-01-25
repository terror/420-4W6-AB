import { pokemonDatabase } from "./pdb";

type Pokemon = {
    name: string;
    type: string;
};

const fetchPokemon = () => {
    const fetchTime = Math.random() * 500;
    setTimeout(() => {
        console.log(pokemonDatabase);
        console.timeEnd("Simulataneous operations with Promise.all(): ");
    }, fetchTime);
};

const createPokemon = (pokemon: Pokemon): Promise<void> => {
    return new Promise((resolve, _) => {
        const createTime = Math.random() * 500;
        setTimeout(() => {
            pokemonDatabase.push(pokemon);
            resolve();
        }, createTime);
    });
};

const p = [
    createPokemon({ name: "Liam", type: "void" }),
    createPokemon({ name: "LOL", type: "vv" }),
    createPokemon({ name: "Ok", type: "wow" }),
    createPokemon({ name: "promise", type: "ye" }),
    createPokemon({ name: "promise", type: "ye" })
];

console.time("Simulataneous operations with Promise.all(): ");
Promise.all(p).then(fetchPokemon);
