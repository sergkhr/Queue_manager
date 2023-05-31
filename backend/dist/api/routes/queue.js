import { ObjectId } from "mongodb";
import { Result } from "../Result.js";
export function get(req, res) {
    console.log("Queue get");
    let queueId;
    try {
        queueId = new ObjectId(req.params.id);
    }
    catch (err) {
        return;
    }
    this.queueManager.getQueue(queueId).then(queue => {
        if (!queue) {
            res.json(new Result(false, "Queue does not exist"));
        }
        else {
            res.json(queue);
        }
    });
}
export function post(req, res) {
}
export function put(req, res) {
    let logged = req.body.logged;
    let login = (logged ? "" : "ul:") + req.body.login;
    console.log("Queue put: " + req.params.id + " " + req.body.command);
    let queueId;
    try {
        queueId = new ObjectId(req.params.id);
    }
    catch (err) {
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
            });
            break;
        }
        default: {
            res.json(new Result(false, "No valid command entered"));
            break;
        }
    }
}
export function subscribe(req, res) {
    let queueId;
    try {
        queueId = new ObjectId(req.params.id);
    }
    catch (err) {
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
    });
}
