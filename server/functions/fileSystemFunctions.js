// REFERENCE: https://www.geeksforgeeks.org/how-to-read-and-write-json-file-using-node-js/

// Functions to read from and write to JSON files.

import fs from "fs";

// Read JSON file using given path
function readJsonFile(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file: " + err);
        return null;
    }
}

// Write given data into JSON file located at given path.
function writeJsonFile(path, data) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
       
    } catch (err) {
        console.error("Error writing file: " + err);
    }
}

export {readJsonFile, writeJsonFile};