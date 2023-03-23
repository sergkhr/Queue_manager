export default class User {
    name: string;
    login: string;
    _password: string;
    constructor(user: User) {
        this.name = user.name;
        this.login = user.login;
        this._password = user.password;
    }
    get password() {
        return ""
    }
    checkPassword(pass: string) {
        return pass == this._password;
    }
}