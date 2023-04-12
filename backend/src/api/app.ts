import bodyParser from "body-parser";
import Express from "express";
import cors from "cors";

import {QueueManager} from "./queue/QueueManager.js";
import {UserManager} from "./user/UserManager.js";
import {Result} from "./Result.js";

export class Application {
    expressApp: Express.Application;
    queueManager: QueueManager;
    userManager: UserManager;
    listener: any;
    config: any;

    constructor(config: any) {
        this.config = config;
        this.expressApp = Express();
        this.queueManager = new QueueManager();
        this.userManager = new UserManager();
        let app = this.expressApp;
        app.use(bodyParser.json());
        this.setupHandlers();
    }

    /**
     * Start the application
     */
    start(): void {
        this.listener = this.expressApp.listen(this.config.port, this.config.host, () => {
            console.log(`App listening at port ${this.config.port}`);
        });
    }

    /**
     * Setup handlers for http requests
     */
    setupHandlers() {
        let app = this.expressApp;
        let vk = this.config.vk;

        // Bot interface
        // let botCors = cors({
        //     origin: vk.address + ":" + vk.port
        // })

        app.use(cors({
            origin: "*"
        }))
        app.post('/admin', this.adminPanelHandler.bind(this));

        app.get('/users', this.usersGetHandler.bind(this));
        app.post('/users', this.usersPostHandler.bind(this));

        app.get('/queues', this.queuesGetHandler.bind(this));
        app.post('/queues', this.queuesPostHandler.bind(this));

        app.get('/queue/:name', this.queueGetHandler.bind(this));
        app.post('/queue/:name', this.queuePostHandler.bind(this));

        app.post('/users/:login', this.userLoginHandler.bind(this));
    }

    /**
     * Save users and queues
     */
    save() {
        console.log("Saving...");
        this.queueManager.save();
        this.userManager.save();
        console.log("Saved");
    }

    adminPanelHandler(req: Express.Request, res: Express.Response) {
        console.log("Admin command got: " + JSON.stringify(req.body));
        if (req.body.command == "turnoff") {
            res.json({text: "Turning off"});
            this.save();
            this.listener.close();
        } else {
            res.json(new Result(false));
        }
    }

    usersGetHandler(req: Express.Request, res: Express.Response) {
        console.log("Users get");
        console.log(JSON.stringify(this.userManager.getUsersList()));
        res.json(this.userManager.getUsersList());
    }

    usersPostHandler(req: Express.Request, res: Express.Response) {
        console.log("Users post");
        if (req.body.command = "create") {
            res.json(this.userManager.createUser(req.body.arguments))
            return;
        }
        res.json(new Result(false, "No command Entered"));
    }

    queuesGetHandler(req: Express.Request, res: Express.Response) {
        console.log("Queues get");
        console.log(JSON.stringify(this.queueManager.getQueueList()));
        res.json(this.queueManager.getQueueList({}, true));
    }

    queuesPostHandler(req: Express.Request, res: Express.Response) {
        console.log("Queues post");
        console.log(JSON.stringify(req.body));
        if (req.body.command = "create") {
            // let queue = {
            //     name: req.body.arguments.name,
            //     owner: {
            //         login: req.body.arguments.owner.login,
            //         vkId: req.body.arguments.owner.vkId
            //     }
            //     config: req.body.arguments.config
            // }
            let queue = this.queueManager.createQueue(req.body.arguments);
            if (queue) {
                if (req.body.arguments.vkConf) {
                    queue.linkVkConf(req.body.arguments.vkConf);
                }
                res.json(new Result(true));
            } else {
                res.json(new Result(false));
            }
        } else {
            res.json(new Result(false, "No command entered"));
        }
    }

    queueGetHandler(req: Express.Request, res: Express.Response) {
        console.log("Queue get");
        console.log(JSON.stringify(req.params));
        let queue = this.queueManager.getQueue(req.params.name);
        if (queue) {
            res.json(queue);
        } else {
            res.json(new Result(false, "Queue not found"));
        }
    }

    queuePostHandler(req: Express.Request, res: Express.Response) {
        console.log("Queue post");
        console.log(JSON.stringify(req.body));
        let queue = this.queueManager.getQueue(req.params.name);
        console.log(queue);
        if (!queue) {
            res.json(new Result(false, "Queue not found"));
            return;
        }
        if (req.body.command = "addPeople") {
            let user = this.userManager.getUser(req.body.arguments.login);
            if (queue.addPeople(req.body.arguments.login, "site")) {
                res.json(new Result(true));
            } else {
                res.json(new Result(false, "Queue is full"));
            }
        } else {
            res.json(new Result(false, "No command entered"));
        }
    }

    userLoginHandler(req: Express.Request, res: Express.Response) {
        console.log("User login");
        console.log(JSON.stringify(req.body));
    }
}