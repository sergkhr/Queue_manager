export class User {
    name?: string;
    login: string;
    password?: string;
    vk?: string;
    
    constructor(user: User) {
        this.name = user.name;
        this.login = user.login;
        this.password = user.password;
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