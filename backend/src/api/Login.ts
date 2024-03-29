import jwt from "jsonwebtoken"
import Express from "express"
import bcrypt from "bcryptjs"

/**
 * Class for login and password encryption
 * @class Login
 * @static
 * @property secretKey - Secret key for token encryption
 */
export class Login {
    private static secretKey: jwt.Secret = "asd";

    public static setSecretKey(secretKey: string) {
        this.secretKey = secretKey;
    }

    public static async loginCheckMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        let token = req.headers["authorization"];
        if (token) {
            jwt.verify(token, Login.secretKey, (err, decoded) => {
                if (err || !decoded) {
                    res.status(401).json({message: "Invalid token: " + JSON.stringify(err)});
                    return;
                } else {
                    let body = decoded as {login: string};
                    console.log("Login: " + body.login)
                    req.body.login = body.login;
                    req.body.logged = true;
                }
            })
        } else {
            req.body.logged = false;
        }
        next();
    }

    public static async getLogin(token: string) {
        try {
            let decoded = jwt.verify(token, this.secretKey) as {login: string};
            return decoded?.login;
        } catch (error) {
            console.log(error);
        }
    }

    public static generateToken(login: string) {
        return jwt.sign({login: login}, this.secretKey, {expiresIn: "12h"});
    }

    public static encryptPassword(password: string) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    public static comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }
}