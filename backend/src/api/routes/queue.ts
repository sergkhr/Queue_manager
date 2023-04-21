import { Result } from "../Result";
import { Application } from "../app";
import Express from "express"

export function get(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Users get");
    
}

export function post(this: Application, req: Express.Request, res: Express.Response) {
    console.log("Users post " + req.body.command);
    
}