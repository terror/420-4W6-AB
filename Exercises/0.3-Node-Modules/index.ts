import { writeToJsonFile, readFromJsonFile } from "./utilities";
import * as faker from "faker";

const f = "pokemon.json";
const x = [
    { name: "Liam", nickname: faker.name.firstName() },
    { name: "Liam", nickname: faker.name.firstName() },
    { name: "Liam", nickname: faker.name.firstName() }
];

writeToJsonFile(f, x);
const p = readFromJsonFile("pokemon.json");
console.log(p);
