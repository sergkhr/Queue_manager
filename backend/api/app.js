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
    }

    save() {
        console.log("Saving...");
        this.queueManager.save();
        this.userManager.save();
        console.log("Saved");
    }
    
    // getTest(req, res) {
    //     let searchString = req.query.searchString || '';
    //     console.log(`GET: ${toString(req.query)}`);
    //     res.json({text: searchString});
    // }

    // postTest(req, res) {
    //     console.log(`POST: ${toString(req.body)}`);
    //     res.json({text: req.body});
    //     this.listener.close(()=>{
    //         console.log("Text");
    //     });
    // }

    adminPanelHandler(req, res) {
        console.log("Admin command got: " + JSON.stringify(req.body));
        if (req.command == "turnoff") {
            res.json({text: "Turning off"});
            this.save();
            this.listener.close();
        } else {
            res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
            res.json({text: "Error"});
        }
    }

    usersPostHandler(req, res) {
        res.json(this.userManager.getUsersList());
        console.log("Users post")
    }
    usersGetHandler(req, res) {
        console.log("Users get")
        console.log(JSON.stringify(this.userManager.getUsersList()));
        res.json(this.userManager.getUsersList());
    }
}