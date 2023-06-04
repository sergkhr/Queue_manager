import { Result } from "../Result.js";
export function get(req, res) {
    console.log("Users get");
    this.userManager.getUsers().then(users => {
        // console.log(users);
        res.json(users);
    });
}
export function post(req, res) {
    console.log("Users post body: " + JSON.stringify(req.body));
    if (req.body.command == "create") {
        let user = req.body.arguments;
        if (!user.login || !user.password || !user.username) {
            res.json(new Result(false, "Login, password and username must be defined"));
            return;
        }
        this.userManager.createUser(user).then(result => {
            res.json(result);
        });
    }
}
