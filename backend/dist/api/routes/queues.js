import { Result } from "../Result.js";
import { ObjectId } from "mongodb";
export function get(req, res) {
    console.log("Queues get");
    this.queueManager.getQueues().then(queues => {
        console.log(queues);
        res.json(queues);
    });
}
export function post(req, res) {
    console.log("Queues post " + req.body.command);
    if (req.body.command == "create") {
        let queue = req.body.arguments;
        queue.config = {
            owner: req.body.login
        };
        if (!queue.name) {
            res.json(new Result(false, "Name must be defined"));
        }
        this.queueManager.createQueue(queue).then(result => {
            res.json(result);
        });
    }
}
export function del(req, res) {
    console.log("Queues del " + req.body.command + " " + req.body.arguments.id);
    if (req.body.command == "delete") {
        let queueId = req.body.arguments.id;
        if (!queueId) {
            res.json(new Result(false, "Id must be defined"));
        }
        this.queueManager.deleleQueue(new ObjectId(queueId)).then(result => {
            console.log(result);
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
