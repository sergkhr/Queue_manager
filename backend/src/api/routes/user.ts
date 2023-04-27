import { Result } from "../Result.js";
import { Application } from "../app.js";
import Express from "express"

export function get(this: Application, req: Express.Request, res: Express.Response) {
    this.userManager.getUser(req.params.login).then(user => {
        if (!user) {
            res.json(new Result(false, "User does not exist"))
        } else {
            res.json(user);
        }
    })
}