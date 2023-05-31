import { Result } from "../Result.js";
import { Login } from "../Login.js";
export async function post(req, res) {
    console.log("Login post " + req.body.login);
    if (!req.body.login || !req.body.password) {
        res.json(new Result(false, "Login and password must be defined"));
        return;
    }
    else {
        let user = await this.userManager.getUser(req.body.login);
        if (!user) {
            res.json(new Result(false, "User does not exist"));
            return;
        }
        if (!Login.comparePassword(req.body.password, user.password)) {
            res.json(new Result(false, "Wrong password"));
            return;
        }
        else {
            res.json(new Result(true, Login.generateToken(user.login)));
        }
    }
}
