import bodyParser from "body-parser";
import Express from "express";
import QueueManager from "./queue/QueueManager.js"

export default class Application {
    constructor() {
        this.expressApp = Express();
        this.manager = new QueueManager();
        this.setupHandlers();
        let app = this.expressApp;
        app.use(bodyParser.json());
        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }
    start(config) {
        this.listener = this.expressApp.listen(config.port, config.host, function() {
            console.log(`App listening at port ${config.port}`);
        });
    }
    setupHandlers() {
        let app = this.expressApp;

        app.get('/rooms', this.getTest.bind(this));
        app.post('/rooms', this.postTest.bind(this));
        app.post('/admin', this.adminPanelHandler.bind(this));
    }
    save() {
        console.log("Saving...");
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

    adminPanelHandler(req, res) {
        console.log("Admin command got: " + JSON.stringify(req.body) + " " + req.command);
        // for (let key in req) {
        //     console.log(key + "-" + JSON.stringify(req[key]));
        // }
        res.json({
            text: "asd"
        });
    }
}