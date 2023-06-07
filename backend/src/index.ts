import {AppConfig, Application} from "./api/app.js"
import process from "node:process"
import fs from "node:fs"
import { MongoClient } from "mongodb"

let config = JSON.parse(fs.readFileSync("config.json", "utf8")) as AppConfig;

console.log("Reading enviroment variables...");
config.db.host = process.env.DB_HOST || config.db.host;
config.db.port = Number(process.env.DB_PORT) || config.db.port;
config.db.rs = process.env.DB_RS || "qm_rs" || "rs0";

console.log("Final config:")
console.log(JSON.stringify(config));

process.on('SIGINT', () => {
    console.info("Interrupted");
    if (app.listener) {
        app.listener.close();
    }
    process.exit(0);
});

console.log("Connecting to db...");
const URL = "mongodb://" + config.db.host + ":" + config.db.port + `/?replicaSet=${config.db.rs}&directConnection=true`;
console.log(URL);
const dbClient: MongoClient = await (MongoClient.connect(URL).catch(err => {
    console.log(err);
    process.abort();
}));

console.log("Starting application");
var app = new Application(dbClient, config);
app.start();