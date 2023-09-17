import bodyParser from "body-parser";
import Express from "express";
import cors from "cors";
import DB from "mongodb";

import * as Routes from "./routes/index.js"

import { QueueManager } from "./queue/QueueManager.js";
import { UserManager } from "./user/UserManager.js";
import { Result } from "./Result.js";
import { Login } from "./Login.js"


export interface ConnectionConfig {
    host: string;
    port: number;
}

export interface DBConfig {
    host: string;
    port: number;
    rs: string;
}

export interface AppConfig {
    server: ConnectionConfig;
    db: DBConfig;
    vk: ConnectionConfig;
}

export class Application {
    listener: any;
    dbClient: DB.MongoClient;
    dbName: string = "queue_manager_db";

    expressApp: Express.Application;
    queueManager: QueueManager;
    userManager: UserManager;
    db: DB.Db;
    config: AppConfig;

    constructor(db: any, config: any) {
        this.dbClient = db;
        this.db = db.db(this.dbName);

        this.config = config;
        this.expressApp = Express();
        
        this.userManager = new UserManager(this.db);
        this.queueManager = new QueueManager(this.db, this.userManager);
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

        app.use(cors({
            origin: "*"
        }))

        app.get('/', Routes.statusGet);
        app.get("/sse/send", Login.loginCheckMiddleware.bind(this), Routes.sseSend.bind(this));
        
        app.post('/admin', this.adminPanelHandler.bind(this));

        app.get('/users', Routes.Users.get.bind(this));
        app.post('/users', Routes.Users.post.bind(this));

        app.get('/user/:login', Routes.User.get.bind(this));
        app.get('/user/:login/subscribe', Routes.User.subscribe.bind(this));

        app.post('/login', Routes.Login.post.bind(this));

        app.get('/queues', Routes.Queues.get.bind(this));
        app.post('/queues', Login.loginCheckMiddleware.bind(this), Routes.Queues.post.bind(this));
        app.delete('/queues', Login.loginCheckMiddleware.bind(this), Routes.Queues.del.bind(this));

        app.get("/queue/:id/check", Routes.Queue.checkExist.bind(this));
        app.get('/queue/:id', Routes.Queue.get.bind(this));
        app.post('/queue/:id', Routes.Queue.post.bind(this));
        app.put('/queue/:id', Login.loginCheckMiddleware.bind(this), Routes.Queue.put.bind(this));
        app.get('/queue/:id/subscribe', Routes.Queue.subscribe.bind(this));
    }

    adminPanelHandler(req: Express.Request, res: Express.Response) {
        console.log("Admin command got: " + JSON.stringify(req.body));
        if (req.body.command == "turnoff") {
            res.json({text: "Turning off"});
            this.listener.close();
            process.exit(0);
        }
        if (req.body.command == "dropUsers") {
            console.log("Deleting " + req.body.user);
            if (!req.body.user) {
                res.json(new Result(false, "Define login!"))
                return;
            }
            this.userManager.deleteUser(req.body.user).catch(err => {
                res.json(new Result(false, err));
            }).then(item => {
                res.json(new Result(true));
            })
            return;
        }
        res.json(new Result(false));
    }
}