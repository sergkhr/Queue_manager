import { User } from "./User.js";
import { Result } from "../Result.js";
export class UserManager {
    constructor(db) {
        this.users = [];
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
}