import { User } from "./User.js";
import { Result } from "../Result.js";
export class UserManager {
    constructor(db) {
        this.users = [];
        this.subscribes = new Map();
        this.db = db;
        this.db.collection("Users").find({}).toArray().catch(err => {
            console.log("Something went wrong during \"Users\" find");
            console.log(err);
        }).then(items => {
            console.log("Users in db: " + (items ? items.length : 0));
        });
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
            let items = item.map(i => i);
            console.log(items);
            return items;
        });
    }
    /**
     * Create new user
     * @param user Template of user
     * @returns Creation result
     */
    async createUser(user) {
        if (this.userIsExist(user.login)) {
            return new Result(false, "User with login '" + user.login + "' alredy exist");
        }
        let existedUser = await this.getUser(user.login);
        if (existedUser != null) {
            // console.log("asdasdasdasdasds");
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
    async getUser(login) {
        return await this.db.collection("Users").findOne({ login: login }).catch(err => {
            console.log("Something went wrong during \"Users\" findOne");
            console.log(err);
            return null;
        }).then(user => {
            if (!user) {
                return null;
            }
            else {
                return user;
            }
        });
    }
    async deleteUser(login) {
        return await this.db.collection("Users").deleteOne({ login: login }).catch(err => {
            console.log("Something went wrong during \"Users\" deleteOne");
            console.log(err);
            return new Result(false);
        }).then(result => {
            return new Result(true);
        });
    }
    // checkPassword(login: string, password: string) {
    //     for (let i in this.users) {
    //         if (this.users[i].login == login) {
    //             if (this.users[i].checkPassword(password)) {
    //                 return new Result(true);
    //             } else {
    //                 return new Result(false, "Wrong password");
    //             }
    //         }
    //     }
    //     return new Result(false, "User with login '" + login + "' not found");
    // }
    userIsExist(login) {
        for (let i in this.users) {
            if (this.users[i].login == login) {
                return true;
            }
        }
        return false;
    }
    async subscribe(login, req, res) {
        console.log(login);
        return await this.getUser(login).catch(err => {
            console.log("Something went wrong");
            return new Result(false);
        }).then(item => {
            var _a;
            console.log(item);
            if (item == null) {
                return new Result(false, "User not found");
            }
            let subID = Date.now();
            if (!this.subscribes.has(login)) {
                this.subscribes.set(login, []);
            }
            (_a = this.subscribes.get(login)) === null || _a === void 0 ? void 0 : _a.push({
                subID: subID,
                res: res,
                lastLogin: ""
            });
            req.on('close', () => {
                var _a, _b, _c, _d;
                console.log(`Connection for user ${login} closed`);
                let subs = this.subscribes.get(login);
                let i = (_a = subs === null || subs === void 0 ? void 0 : subs.length) !== null && _a !== void 0 ? _a : 0;
                subs = (_b = subs === null || subs === void 0 ? void 0 : subs.filter(sub => { sub.subID !== subID; })) !== null && _b !== void 0 ? _b : [];
                let ii = (_d = (_c = this.subscribes.get(login)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
                console.log(`Deleted ${i - ii} subscribes`);
            });
            return new Result(true);
        });
    }
    async notifyUser(login, queue, force = false) {
        var _a;
        console.log(`Searching for subs : ${login}`);
        let subs = (_a = this.subscribes.get(login)) !== null && _a !== void 0 ? _a : [];
        console.log(subs);
        for (let sub of subs) {
            if ((sub.lastLogin != login && sub.lastLogin != "") || force) {
                sub.lastLogin;
                console.log("Sending SSE to user");
                sub.res.write(`data: ${JSON.stringify(queue)}\n\n`);
            }
        }
    }
}
