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
            // console.log(rawUsers[i]);
        }
        // fs.writeFileSync("users.json", JSON.stringify({name: "text"}));
    }
    save() {
        fs.writeFileSync("data/users.json", JSON.stringify(this.users, null, 4));
    }
    getUsersList() {
        return this.users;
    }
    userIsExist(name) {
        for (let i in this.users) {
            if (this.users[i].name == name) {
                return true;
            }
        }
        return false;
    }
    createUser(user) {
        if (!this.userIsExist(user.name)) {
            this.users.push(new User(user));
            return new Result(true);
        }
        return new Result(false, "User with name '" + user.name + "' alredy exist");
    }
}