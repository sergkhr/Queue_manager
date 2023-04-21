import { Application } from "../app";
import Express from "express";
import { Result } from "../Result.js";

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Users get");
    this.userManager.getUsers().then(users =>{
        console.log(users);
        res.json(users);
    });
}

export function post(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Users post " + req.body.command);
    if (req.body.command == "create") {
        let user = req.body.arguments;
        if (!user.login) {
            res.json(new Result(false, "Login must be defined"));
        }
        this.userManager.createUser(user).then(result => {
            res.json(result);
        });
    }
}