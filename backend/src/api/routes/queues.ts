import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"
import { IQueue, PeopleType } from "../queue/Queue.js";
import { ObjectId } from "mongodb";

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queues get");
    this.queueManager.getQueues().then(queues => {
        console.log(queues);
        res.json(queues);
    })
}

export function post(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queues post " + req.body.command);
    if (req.body.command == "create") {
        let queue = req.body.arguments as IQueue;
        queue.config = queue.config || {};
        queue.config.owner = {
            login: req.body.login,
            type: PeopleType.SITE
        }
        if (!req.body.logged) {
            queue.config.owner.login = "unknown";
            queue.config.owner.type = PeopleType.NOT_LOGGED;
        }
        
        if (!queue.name) {
            res.json(new Result(false, "Name must be defined"));
            console.log("1")
            return;
        }
        this.queueManager.createQueue(queue).then(result => {
            res.json(result);
            console.log("2")
            console.log(JSON.stringify(result))
        }).catch(e => {
            res.json(new Result(true));
            console.log("3")
        });
    } else {
        res.json(new Result(false));
    }
}

export function del(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queues del " + req.body.command + " " + req.body.arguments.id);
    if (req.body.command == "delete") {
        let queueId = req.body.arguments.id as string;
        if (!queueId) {
            res.json(new Result(false, "Id must be defined"));
        }
        this.queueManager.deleleQueue(new ObjectId(queueId)).then(result => {
            console.log(result);
            res.json(result);
        });
    }
}