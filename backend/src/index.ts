import {AppConfig, Application} from "./api/app.js"
import process from "node:process"
import fs from "node:fs"
import { MongoClient } from "mongodb"

let config = JSON.parse(fs.readFileSync("config.json", "utf8")) as AppConfig;

console.log("Connecting to db...");

const dbClient: MongoClient = await (MongoClient.connect("mongodb://" + config.db.host + ":" + config.db.port).catch(err => {
    console.log(err);
    process.abort();
}));
var app = new Application(dbClient, config);
app.start();

process.on('SIGINT', () => {
    // app.save();
    if (app.listener) {
        app.listener.close();
    }
});