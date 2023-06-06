import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
/**
 * Class for login and password encryption
 * @class Login
 * @static
 * @property secretKey - Secret key for token encryption
 */
class Login {
    static setSecretKey(secretKey) {
        this.secretKey = secretKey;
    }
    static async loginCheckMiddleware(req, res, next) {
        // console.log(req.headers["authorization"])
        let token = req.headers["authorization"];
        if (token) {
            jwt.verify(token, Login.secretKey, (err, decoded) => {
                if (err || !decoded) {
                    res.status(401).json({ message: "Invalid token: " + JSON.stringify(err) });
                    return;
                }
                else {
                    let body = decoded;
                    console.log("Login: " + body.login);
                    req.body.login = body.login;
                    req.body.logged = true;
                }
            });
        }
        else {
            req.body.logged = false;
        }
        next();
    }
    static async getLogin(token) {
        try {
            let decoded = jwt.verify(token, this.secretKey);
            return decoded === null || decoded === void 0 ? void 0 : decoded.login;
        }
        catch (error) {
            console.log(error);
        }
    }
    static generateToken(login) {
        return jwt.sign({ login: login }, this.secretKey, { expiresIn: "12h" });
    }
    static encryptPassword(password) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
    static comparePassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
}
Login.secretKey = "asd";
export { Login };
