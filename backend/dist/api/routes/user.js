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
export function subscribe(req, res) {
    console.log("User subscribe get");
    let login = req.params.login;
    this.userManager.subscribe(login, req, res).catch(err => {
        console.log("ADSFASDF");
        res.status(400).json(new Result(false));
    }).then(item => {
        if (!item || !item.success) {
            res.json(new Result(false));
            return;
        }
        console.log('User subscribe successful');
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        // res.write("data: text\n\n");
    });
}
