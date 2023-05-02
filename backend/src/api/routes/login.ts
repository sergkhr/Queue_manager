import Express from "express";
import { Result } from "../Result.js";
import { Login } from "../Login.js";
import { Application } from "../app.js";

export async function post(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Login post " + req.body.login)
    if (!req.body.login || !req.body.password) {
        res.json(new Result(false, "Login and password must be defined"));
        return;
    } else {
        let user = await this.userManager.getUser(req.body.login);
        if (!user) {
            res.json(new Result(false, "User does not exist"));
            return;
        }
        if (!Login.comparePassword(req.body.password, user.password)) {
            res.json(new Result(false, "Wrong password"));
            return;
        } else {
            res.json(new Result(true, Login.generateToken(user.login)));
        }
    }
}