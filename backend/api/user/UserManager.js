import User from "./User.js"
import fs from "fs"

import Result from "../Result.js";

export default class UserManager {
    constructor() {
        this.users = [];
        this.load();
    }
    load() {
        let rawUsers = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
        for (let i in rawUsers) {
            this.users.push(new User(rawUsers[i]));
        }
        console.log("Users loaded: " + this.users.length);
    }
    save() {
        fs.writeFileSync("data/users.json", JSON.stringify(this.users, null, 4));
        console.log("Users saved: " + this.users.length);
    }
    getUsersList() {
        return this.users;
    }
    getUser(login) {
        return this.users[id];
    }
    checkPassword(login, password) {
        for (let i in this.users) {
            if (this.users[i].login == login) {
                if (this.users[i].checkPassword(password)) {
                    return new Result(true);
                } else {
                    return new Result(false, "Wrong password");
                }
            }
        }
        return new Result(false, "User with login '" + login + "' not found");
    }

    userIsExist(login) {
        for (let i in this.users) {
            if (this.users[i].login == login) {
                return true;
            }
        }
        return false;
    }
    createUser(user) {
        if (this.userIsExist(user.login)) {
            return new Result(false, "User with name '" + user.name + "' alredy exist");
        }
        this.users.push(new User(user));
        return new Result(true);
    }
}