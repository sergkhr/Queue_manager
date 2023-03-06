import Application from "./api/app.js";
import config from "./config.json" assert {type: 'json' };
import process from "node:process"

let app = new Application();
app.start(config);

process.on('SIGINT', () => {
    app.save();
    app.listener.close();
});