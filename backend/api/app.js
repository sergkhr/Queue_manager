import bodyParser from "body-parser";
import Express from "express";
import cors from "cors";
import QueueManager from "./queue/QueueManager.js";
import UserManager from "./user/UserManager.js";

export default class Application {
    constructor() {
        this.expressApp = Express();
        this.queueManager = new QueueManager();
        this.userManager = new UserManager();
        let app = this.expressApp;
        app.use(cors({
            origin: "*"
        }))
        app.use(bodyParser.json());
        this.setupHandlers();
    }

    start(config) {
        this.listener = this.expressApp.listen(config.port, config.host, function() {
            console.log(`App listening at port ${config.port}`);
        });
    }

    setupHandlers() {
        let app = this.expressApp;
        app.post('/admin', this.adminPanelHandler.bind(this));

        app.get('/users', this.usersGetHandler.bind(this));
        app.post('/users', this.usersPostHandler.bind(this));

        app.get('/queues', this.queueGetHandler.bind(this));
        app.post('/queues', this.queuePostHandler.bind(this));
    }

    save() {
        console.log("Saving...");
        this.queueManager.save();
        this.userManager.save();
        console.log("Saved");
    }

    adminPanelHandler(req, res) {
        console.log("Admin command got: " + JSON.stringify(req.body));
        if (req.body.command == "turnoff") {
            res.json({text: "Turning off"});
            this.save();
            this.listener.close();
        } else {
            // res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
            res.json({text: "Error"});
        }
    }

    usersGetHandler(req, res) {
        console.log("Users get");
        console.log(JSON.stringify(this.userManager.getUsersList()));
        res.json(this.userManager.getUsersList());
    }
    usersPostHandler(req, res) {
        console.log("Users post");
        if (req.body.command = "create") {
            let user = {
                name: req.body.arguments.name,
                password: req.body.arguments.password
            }
            if (this.userManager.createUser(user)){
                res.json({result: "Success"});
            } else {
                res.json({result: "Error"});
            }
        }
        res.json({result: "No command entered"});
    }

    queueGetHandler(req, res) {
        console.log("Queues get");
        console.log(JSON.stringify(this.queueManager.getQueueList()));
        res.json(this.queueManager.getQueueList());
    }
    queuePostHandler(req, res) {
        console.log("Queues post");
        console.log(JSON.stringify(req.body));
        if (req.body.command = "create") {
            let queue = {
                name: req.body.arguments.name,
                config: req.body.arguments.config
            }
            if (this.queueManager.createQueue(queue)){
                res.json({result: "Success"});
            } else {
                res.json({result: "Error"});
            }
        } else {
            res.json({result: "No command entered"});
        }
    }
}