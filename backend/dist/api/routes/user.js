import { Result } from "../Result.js";
export function get(req, res) {
    console.log("User get: " + req.params.login);
    this.userManager.getUser(req.params.login).then(user => {
        if (!user) {
            res.json(new Result(false, "User does not exist"));
        }
        else {
            res.json(user);
        }
    });
}
