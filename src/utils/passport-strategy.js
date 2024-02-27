import passport from "passport";
import JwtStrategy from "passport-jwt/lib/strategy.js";
import LocalStrategy from "passport-local/lib/strategy.js";
import {config} from "../config.js";
import {UserRecord} from "../records/user.record.js";
import {compare} from "bcrypt";
import {ExtractJwt} from "passport-jwt";

const {JWT_SECRET} = config;

passport.use(new LocalStrategy(
    {
        usernameField: 'name',
        passwordField: 'password',
    },
    async (username, password, done) => {
        try {
            const user = await UserRecord.findOneByName(username);
            if (!user) {
                return done(null, false, {message: 'Invalid login credentials.'});
            }

            const isMatch = await compare(password, user.passwordHash);
            if (!isMatch) {
                return done(null, false, {message: 'Invalid login credentials.'});
            }

            return done(null, user);

        } catch (error) {
            return done(error);
        }
    }));

passport.use(new JwtStrategy({
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
}, async (jwtPayload, done) => {
    try {
        const user = await UserRecord.findOneById(jwtPayload.sub);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error);
    }
}));

export default passport;
