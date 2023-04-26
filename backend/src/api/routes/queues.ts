import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"
import { IQueue } from "../queue/Queue.js";

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
        if (!queue.name) {
            res.json(new Result(false, "Name must be defined"));
        }
        this.queueManager.createQueue(queue).then(result => {
            res.json(result);
        });
    }
}

// queuesPostHandler(req: Express.Request, res: Express.Response) {
//     if (req.body.command = "create") {
//         let queue = this.queueManager.createQueue(req.body.arguments);
//         if (queue) {
//             if (req.body.arguments.vkConf) {
//                 queue.linkVkConf(req.body.arguments.vkConf);
//             }
//             res.json(new Result(true));
//         } else {
//             res.json(new Result(false));
//         }
//     } else {
//         res.json(new Result(false, "No command entered"));
//     }
// }