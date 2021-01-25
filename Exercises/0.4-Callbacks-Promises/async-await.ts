import { pokemonDatabase } from "./pdb";

type Pokemon = {
    name: string;
    type: string;
};

const fetchPokemon = () => {
    const fetchTime = Math.random() * 500;
    setTimeout(() => {
        console.log(pokemonDatabase);
        console.timeEnd("Sequential operations with Async/Await: ");
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

console.time("Sequential operations with Async/Await: ");
const createAllPokemon = async () => {
    await createPokemon({ name: "wow", type: "yes" });
    await createPokemon({ name: "ok", type: "yes" });
    await createPokemon({ name: "ll", type: "bb" });
    await createPokemon({ name: "llvm", type: "c++" });
    await createPokemon({ name: "oooooook", type: "go" });
    fetchPokemon();
};

createAllPokemon();
