// write and load json files
import { readFileSync, writeFileSync } from 'fs'

const JSON_PATH = "miner_data.json";
const OUTPUT_PATH = "output.txt";

// write json file
export function writeJsonFile(field:string, data: any) {
    console.log("Writing to json file: " + field + " " + data + "\n");
    let jsonData = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
    console.log(jsonData);
    jsonData[field] = data;
    writeFileSync(JSON_PATH, JSON.stringify(jsonData));
}

// load json file
export function loadJsonFile() {
    return JSON.parse(readFileSync(JSON_PATH, 'utf8'));
}


// write output file
export function writeOutputFile(data: any, file_name = OUTPUT_PATH) {
    writeFileSync(file_name, JSON.stringify(data));
}