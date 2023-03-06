import bodyParser from "body-parser";
import Express from "express";
import QueueManager from "./queue/QueueManager.js"

export default class Application {
    constructor() {
        this.expressApp = Express();
        this.manager = new QueueManager();
        this.setupHandlers();
    }
    start(config) {
        this.listener = this.expressApp.listen(config.port, config.host, function() {
            console.log(`App listening at port ${config.port}`);
        });
    }
    save() {
        console.log("Saving...");
    }
    setupHandlers() {
        let app = this.expressApp;
        let jsonParser = bodyParser.json();
        app.get('/rooms', this.getTest.bind(this));
        app.post('/rooms', jsonParser, this.postTest.bind(this));
    }
    getTest(req, res) {
        let searchString = req.query.searchString || '';
        console.log(`GET: ${toString(req.query)}`);
        res.json({text: searchString});
    }
    postTest(req, res) {
        console.log(`POST: ${toString(req.body)}`);
        res.json({text: req.body});
        this.listener.close(()=>{
            console.log("Text");
        });
    }
}