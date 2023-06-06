import { ObjectId } from "mongodb";
import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"
import { PeopleType } from "../queue/Queue.js";

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
    let type = logged ? PeopleType.SITE : PeopleType.NOT_LOGGED;
    let login = req.body.login;

    console.log("Queue put: " + req.params.id + " " + req.body.command)
    let queueId: ObjectId;
    try {
        queueId = new ObjectId(req.params.id);
    } catch (err: any) {
        res.json(new Result(false, err));
        return;
    }

    if (!login && req.body.command != "pop") {
        res.json(new Result(false, "You must be logged in or enter login to join"));
        return;
    }

    if (!this.queueManager.hasRights(queueId, req.body.login)) {
        res.json(new Result(false, "You have no rights to edit this queue"));
        return;
    }
    switch (req.body.command) {
        case "join": {
            this.queueManager.joinQueue(queueId, login, type).then(result => {
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

export function subscribe(this: Application, req: Express.Request, res: Express.Response) {
    let queueId: ObjectId;
    try {
        queueId = new ObjectId(req.params.id);
    } catch (err) {
        return;
    }
    this.queueManager.subscribe(queueId, req, res).catch(err => {
        res.status(400).json(new Result(false));
    }).then(item => {
        console.log('Queue subscribe successful');
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
    })
}

export function checkExist(this: Application, req: Express.Request, res: Express.Response) {
    let queueId: ObjectId;
    try {
        queueId = new ObjectId(req.params.id);
    } catch (err) {
        return;
    }
    this.queueManager.getQueue(queueId).catch(err => {
        res.json(new Result(false))
    }).then(item => {
        if (item) {
            res.json(new Result(true));
        } else {
            res.json(new Result(false, "Queue does not exist"));
        }
    })
}