import { ObjectId } from "mongodb";
import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queue get");
    this.queueManager.getQueue(req.params.id).then(queue => {
        if (!queue) {
            res.json(new Result(false, "Queue does not exist"));
        } else {
            res.json(queue);
        }
    })
}

export function post(this: Application, req: Express.Request, res: Express.Response) {
    
}

export function put(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queue put");
    let queueId = req.params.id;
    let login = req.body.login;
    if (!queueId) {
        res.json(new Result(false, "Id must be defined"));
    }
    if (!login) {
        res.json(new Result(false, "You must be logged in"));
    }
    if (req.body.command == "join") {
        this.queueManager.joinQueue(queueId, login).then(result => {
            res.json(result);
        });
    } else if (req.body.command == "leave") {
        this.queueManager.leaveQueue(queueId, login).then(result => {
            res.json(result);
        });
    } else {
        res.json(new Result(false, "No valid command entered"));
    }
}