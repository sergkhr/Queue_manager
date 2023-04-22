import { Login } from "../Login.js";

export interface IUser {
    name?: string;
    login: string;
    password: string;
    vk?: string;
}

export class User implements IUser{
    name?: string;
    login: string;
    password: string;
    vk?: string;
    
    constructor(user: User) {
        this.name = user?.name;
        this.login = user.login;
        this.password = Login.encryptPassword(user.password);
        this.vk = user.vk;
    }
    // get password() {
    //     return ""
    // }
    // checkPassword(pass: string) {
    //     return pass == this._password;
    // }
    // getMainLogin() {
    //     if (this.vk) {
    //         return this.vk;
    //     }
    //     return this.login;
    // }
}