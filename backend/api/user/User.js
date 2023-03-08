export default class User {
    constructor(user) {
        this.name = user.name;
        this._password = user.password;
    }
    get password() {
        return ""
    }
    checkPassword(pass) {
        return pass == this._password;
    }
}