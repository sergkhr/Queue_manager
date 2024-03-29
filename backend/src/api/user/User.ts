import { Login } from "../Login.js";

export interface IUser {
    username?: string;
    login: string;
    password: string;
    vk?: string;
}

export class User implements IUser{
    username?: string;
    login: string;
    password: string;
    vk?: string;
    name?: string;
    
    constructor(user: User) {
        this.username = user?.username || user?.name;
        this.login = user.login;
        this.password = Login.encryptPassword(user.password);
        this.vk = user.vk;
    }
}