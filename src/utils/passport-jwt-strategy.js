import passport from "passport";
import {Strategy, ExtractJwt} from "passport-jwt";
import {config} from "../config.js";
import {UserRecord} from "../records/user.record.js";

const {JWT_SECRET} = config;

passport.use(new Strategy({
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies['jwt'];
            }
            return token;
        }
    ]),
    secretOrKey: JWT_SECRET
}, async (jwt_payload, done) => {
    const user = await UserRecord.findOneById(jwt_payload.sub);
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));
