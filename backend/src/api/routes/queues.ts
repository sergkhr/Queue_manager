import { Result } from "../Result";
import { Application } from "../app";
import Express from "express"

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queues get");
    this.queueManager.getQueues().then(queues => {
        console.log(queues);
        res.json(queues);
    })
}

export function post(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Queues post " + req.body.command);
    // if (req.body.command == "create") {
    //     let queue = req.body.arguments;
    //     if (!queue.login) {
    //         res.json(new Result(false, "Login must be defined"));
    //     }
    //     this.userManager.createUser(user).then(result => {
    //         res.json(result);
    //     });
    // }
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