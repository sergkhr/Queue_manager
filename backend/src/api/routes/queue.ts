import { ObjectId } from "mongodb";
import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queue get");
    let queueId: ObjectId;
    try {
        queueId = new ObjectId(req.params.id);
    } catch (err) {
        return;
    }
    this.queueManager.getQueue(queueId).then(queue => {
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
    let login = req.body.login;
    let queueId: ObjectId;
    try {
        queueId = new ObjectId(req.params.id);
    } catch (err) {
        return;
    }

    if (!login) {
        res.json(new Result(false, "You must be logged in"));
        return;
    }
    if (!this.queueManager.hasRights(queueId, req.body.login)) {
        res.json(new Result(false, "You have no rights to edit this queue"));
        return;
    }
    if (req.body.command == "join") {
        this.queueManager.joinQueue(queueId, login).then(result => {
            res.json(result);
        });
    } else if (req.body.command == "leave") {
        this.queueManager.leaveQueue(queueId, login).then(result => {
            res.json(result);
        });
    } else if (req.body.command == "freeze") {
        this.queueManager.freezeUser(queueId, login).then(result => {
            res.json(result);
        });
        
    } else {
        res.json(new Result(false, "No valid command entered"));
    }
}