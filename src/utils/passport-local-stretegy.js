import passport from "passport";
import Strategy from "passport-local";
import {compare} from "bcrypt";
import {UserRecord} from "../records/user.record.js";

passport.use(new Strategy(async (userName, password, done) => {
        try {
            const user = await UserRecord.findOneByName(userName);
            if (!user) {
                return done(null, false, {message: 'Nieprawidłowe dane logowania.'});
            }

            const isMatch = await compare(password, user.passwordHash);
            if (!isMatch) {
                return done(null, false, { message: 'Nieprawidłowe dane logowania.' });
            }

            return done(null, user);

        } catch (error) {
            return done(error);
        }
    }));
