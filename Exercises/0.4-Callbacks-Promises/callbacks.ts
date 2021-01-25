import { pokemonDatabase } from "./pdb";

type Pokemon = {
    name: string;
    type: string;
};

const fetchPokemon = () => {
    const fetchTime = Math.random() * 500;
    setTimeout(() => {
        console.log(pokemonDatabase);
        console.timeEnd("Sequential operations with callbacks");
    }, fetchTime);
};

const createPokemon = (pokemon: Pokemon, callback: Function) => {
    const createTime = Math.random() * 500;
    setTimeout(() => {
        pokemonDatabase.push(pokemon);
        callback();
    }, createTime);
};

console.time("Sequential operations with callbacks");
createPokemon({ name: "Liam", type: "void" }, () => {
    createPokemon({ name: "Wow", type: "null" }, () => {
        createPokemon({ name: "ok", type: "ok" }, () => {
            createPokemon({ name: "Wow", type: "null" }, () => {
                createPokemon({ name: "Wow", type: "null" }, () => {
                    createPokemon(
                        { name: "Hello", type: "world" },
                        fetchPokemon
                    );
                });
            });
        });
    });
});
