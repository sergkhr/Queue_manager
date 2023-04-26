import { ObjectId } from "mongodb";
import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queue get");
    this.db.collection("Queues").findOne({_id: new ObjectId(req.params.id)}).catch(err => {
        console.log(err);
    }).then(queue => {
        if (!queue) {
            res.json(new Result(false, "User does not exist"))
        } else {
            res.json(queue);
        }
    })
    
}

export function post(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queue post " + req.body.command);
    
}