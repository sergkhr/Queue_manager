import Express from "express"
export * as Queue from "./queue.js"
export * as Users from "./users.js"
export * as Queues from "./queues.js"
export * as User from './user.js'
export * as Login from './login.js'

export function statusGet(req: Express.Request, res: Express.Response){
    res.status(200).json({});
}