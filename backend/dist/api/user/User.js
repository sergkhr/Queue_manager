import { Login } from "../Login.js";
export class User {
    constructor(user) {
        this.username = (user === null || user === void 0 ? void 0 : user.username) || (user === null || user === void 0 ? void 0 : user.name);
        this.login = user.login;
        this.password = Login.encryptPassword(user.password);
        this.vk = user.vk;
    }
}
