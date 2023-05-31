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
    let logged = req.body.logged;
    let login = (logged ? "" : "ul:") + req.body.login;
    console.log("Queue put: " + req.params.id + " " + req.body.command)
    let queueId: ObjectId;
    try {
        queueId = new ObjectId(req.params.id);
    } catch (err: any) {
        res.json(new Result(false, err));
        return;
    }

    if (!login) {
        res.json(new Result(false, "You must be logged in or enter login to join"));
        return;
    }

    if (!this.queueManager.hasRights(queueId, req.body.login)) {
        res.json(new Result(false, "You have no rights to edit this queue"));
        return;
    }
    switch (req.body.command) {
        case "join": {
            this.queueManager.joinQueue(queueId, login).then(result => {
                res.json(result);
            });
            break;
        }
        case "leave": {
            this.queueManager.leaveQueue(queueId, login).then(result => {
                res.json(result);
            });
            break;
        }
        case "freeze": {
            this.queueManager.freezeUser(queueId, login).then(result => {
                res.json(result);
            });
            break;
        }
        case "pop": {
            this.queueManager.popQueue(queueId).then(result => {
                res.json(result);
            })
            break;
        }
        default: {
            res.json(new Result(false, "No valid command entered"));
            break;
        }
    }
}