import Application from "./api/app.js"
import process from "node:process"
import fs from "node:fs"

let config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var app = new Application(config);
app.start();

process.on('SIGINT', () => {
    app.save();
    if (app.listener) {
        app.listener.close();
    }
});