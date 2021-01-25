import { pokemonDatabase } from "./pdb";

type Pokemon = {
    name: string;
    type: string;
};

const fetchPokemon = () => {
    const fetchTime = Math.random() * 500;
    setTimeout(() => {
        console.log(pokemonDatabase);
        console.timeEnd("Sequential operations with promise chaining: ");
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

console.time("Sequential operations with promise chaining: ");
createPokemon({ name: "Liam", type: "void" }).then(() =>
    createPokemon({ name: "Liam", type: "void" }).then(() =>
        createPokemon({ name: "Liam", type: "void" }).then(() =>
            createPokemon({ name: "Liam", type: "void" }).then(() =>
                createPokemon({ name: "Wow", type: "null" }).then(() =>
                    fetchPokemon()
                )
            )
        )
    )
);
