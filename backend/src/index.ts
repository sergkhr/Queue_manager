import Application from "./api/app.js";
// import config from "../config.json"
import process from "node:process"
import fs from "node:fs"

let config = JSON.parse(fs.readFileSync("config.json", "utf8"));

let app = new Application();
app.start(config);

process.on('SIGINT', () => {
    app.save();
    if (app.listener) {
        app.listener.close();
    }
});