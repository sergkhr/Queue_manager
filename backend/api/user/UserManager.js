import User from "./User.js"
import fs from "fs"

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
        fs.writeFileSync("./../../data/users.json", JSON.stringify(users, null, 4));
    }
    getUsersList() {
        return this.users;
    }
}