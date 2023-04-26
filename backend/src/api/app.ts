import bodyParser from "body-parser";
import Express from "express";
import cors from "cors";
import DB from "mongodb";
import jwt from "jsonwebtoken";

import * as Routes from "./routes/index.js"

import {QueueManager} from "./queue/QueueManager.js";
import {UserManager} from "./user/UserManager.js";
import {Result} from "./Result.js";
import { User } from "./user/User.js";
import { Login } from "./Login.js";

export interface ConnectionConfig {
    host: string;
    port: number;
}

export interface AppConfig {
    server: ConnectionConfig;
    db: ConnectionConfig;
    vk: ConnectionConfig;
}

export class Application {
    expressApp: Express.Application;
    queueManager: QueueManager;
    userManager: UserManager;
    listener: any;
    config: AppConfig;
    dbClient: DB.MongoClient;
    db: DB.Db;
    dbName: string = "queue_manager_db";

    constructor(db: any, config: any) {
        this.dbClient = db;
        this.db = db.db(this.dbName);

        this.config = config;
        this.expressApp = Express();
        this.queueManager = new QueueManager(this.db);
        this.userManager = new UserManager(this.db);
        let app = this.expressApp;
        
        app.use(bodyParser.json());
        this.setupRoutes();
    }

    /**
     * Start the application
     */
    start(): void {
        this.listener = this.expressApp.listen(this.config.server.port, this.config.server.host, () => {
            console.log(`App listening at port ${this.config.server.port}`);
        });
    }

    /**
     * Setup routes for http requests
     */
    setupRoutes() {
        let app = this.expressApp;
        let vk = this.config.vk;

        // Bot interface
        // let botCors = cors({
        //     origin: vk.address + ":" + vk.port
        // })
        // Routes.asd.bind(this)();

        app.use(cors({
            origin: "*"
        }))
        
        app.post('/admin', this.adminPanelHandler.bind(this));

        app.get('/users', Routes.Users.get.bind(this));
        app.post('/users', Routes.Users.post.bind(this));

        app.get('/user/:login', Routes.User.get.bind(this));

        app.post('/login', Routes.Login.post.bind(this));

        app.get('/queues', Routes.Queues.get.bind(this));
        app.post('/queues', Routes.Queues.post.bind(this));

        app.get('/queue/:name', Routes.Queue.get.bind(this));
        app.post('/queue/:name', Routes.Queue.post.bind(this));

        // app.get('/login', (req, res) => {
        //     res.json(Login.generateToken("test"));
        // });
        // app.get('/check', (req, res) => {
        //     console.log(req.headers.authorization)
        //     if (req.headers.authorization) {
        //         console.log(jwt.decode(req.headers.authorization, ));
        //         res.json(Login.getLogin(req.headers.authorization));
        //     }
        // })
    }

    adminPanelHandler(req: Express.Request, res: Express.Response) {
        console.log("Admin command got: " + JSON.stringify(req.body));
        if (req.body.command == "turnoff") {
            res.json({text: "Turning off"});
            // this.save();
            this.listener.close();
        } else {
            res.json(new Result(false));
        }
    }
}