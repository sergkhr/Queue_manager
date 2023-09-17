import {IUser, User} from "./User.js"

import {Result} from "../Result.js";
import Db from "mongodb";
import Express from "express"
import { IQueue } from "../queue/Queue.js";

interface userSubscribe {
    subID: number;
    res: Express.Response;
    lastLogin: string;
} 

export class UserManager {
    db: Db.Db;
    users: User[] = [];
    subscribes: Map<string, userSubscribe[]> = new Map();

    constructor(db: Db.Db) {
        this.db = db;
        this.db.collection("Users").find({}).toArray().catch(err => {
            console.log("Something went wrong during \"Users\" find");
            console.log(err);
        }).then(items => {
            console.log("Users in db: " + (items ? items.length : 0));
        })
    }

    /**
     * Get all users
     * @returns array of users
     */
    async getUsers() {
        // return await this.db.collection("Users").find({}).toArray();
        return await this.db.collection("Users").find({}).toArray().catch(err => {
            console.log("Something went wrong during \"Users\" find");
            console.log(err);
            return [];
        }).then(item => {
            let items = item.map(i => i as unknown as IUser)
            console.log(items);
            return items;
        });
    }

    /**
     * Create new user
     * @param user Template of user
     * @returns Creation result
     */
    async createUser(user: IUser) {
        if (this.userIsExist(user.login)) {
            return new Result(false, "User with login '" + user.login + "' alredy exist");
        }
        let existedUser = await this.getUser(user.login);

        if (existedUser != null) {
            return new Result(false, `User with login ${user.login} already exist`);
        }

        return await this.db.collection("Users").insertOne(new User(user)).catch(err => {
            console.log("Something went wrong during \"Users\" insertOne");
            console.log(err);
            return new Result(false);
        }).then(item => {
            return new Result(true);
        });
        
    }

    async getUser(login: string) {
        return await this.db.collection("Users").findOne({login: login}).catch(err => {
            console.log("Something went wrong during \"Users\" findOne");
            console.log(err);
            return null;
        }).then(user => {
            if (!user) {
                return null;
            } else {
                return user as unknown as IUser;
            }
        })
    }

    async deleteUser(login: string) {
        return await this.db.collection("Users").deleteOne({login: login}).catch(err => {
            console.log("Something went wrong during \"Users\" deleteOne");
            console.log(err);
            return new Result(false);
        }).then(result => {
            return new Result(true);
        })
    }

    userIsExist(login: string) {
        for (let i in this.users) {
            if (this.users[i].login == login) {
                return true;
            }
        }
        return false;
    }

    async subscribe(login: string, req: Express.Request, res: Express.Response) {
        console.log(login)
        return await this.getUser(login).catch(err => {
            console.log("Something went wrong");
            return new Result(false);
        }).then(item => {
            console.log(item);
            if (item == null) {
                return new Result(false, "User not found");
            }
            let subID = Date.now();
            if (!this.subscribes.has(login)) {
                this.subscribes.set(login, []);
            }
            this.subscribes.get(login)?.push({
                subID: subID,
                res: res,
                lastLogin: ""
            })

            req.on('close', () => {
                console.log(`Connection for user ${login} closed`);
                let subs = this.subscribes.get(login)
                let i = subs?.length ?? 0
                subs = subs?.filter(sub => {sub.subID !== subID}) ?? []

                let ii = this.subscribes.get(login)?.length ?? 0;
                console.log(`Deleted ${i - ii} subscribes`);
            })
            return new Result(true)
        })
    }

    async notifyUser(login: string, queue: IQueue, force: boolean = false) {
        console.log(`Searching for subs : ${login}`);
        let subs = this.subscribes.get(login) ?? [];
        console.log(subs);
        for (let sub of subs) {
            if (sub.lastLogin != login || force) {
                sub.lastLogin
                console.log("Sending SSE to user");
                sub.res.write(`data: ${JSON.stringify(queue)}\n\n`);
            }
        }
    }
}