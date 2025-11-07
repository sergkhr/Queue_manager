import Express from "express"
import { Application } from "../app.js"
import { PeopleType } from "../queue/Queue.js"

export * as Queue from "./queue.js"
export * as Users from "./users.js"
export * as Queues from "./queues.js"
export * as User from './user.js'
export * as Login from './login.js'

export function statusGet(req: Express.Request, res: Express.Response){
    res.status(200).json({});
}

export function sseSend(this: Application, req: Express.Request, res: Express.Response) {
    let login = req.body.login;
    this.userManager.notifyUser(login, {
        name: "SSE test",
        config: {
            owner: {
                login: "test",
                type: PeopleType.SITE
            }
        },
        queuedPeople: [
            {
                login: "admin",
                type: PeopleType.SITE,
                frozen: false
            }
        ]
    }, true)
    res.json()
}