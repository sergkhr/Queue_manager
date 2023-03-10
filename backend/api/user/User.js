export default class User {
    constructor(user) {
        this.name = user.name;
        this.login = user.login;
        this._password = user.password;
    }
    get password() {
        return ""
    }
    checkPassword(pass) {
        return pass == this._password;
    }
}