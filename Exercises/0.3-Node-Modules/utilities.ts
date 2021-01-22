import { readFileSync, writeFileSync } from "fs";

const readFromJsonFile = (filename: string): string => {
    return JSON.parse(readFileSync(filename).toString());
};

const writeToJsonFile = (filename: string, data: object): void => {
    writeFileSync(filename, JSON.stringify(data));
};

export { readFromJsonFile, writeToJsonFile };
