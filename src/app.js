import express from "express";
import "express-async-errors";
import {homeRouter} from "./routes/home.js";
import {loginRouter} from "./routes/login.js";
import {mailRouter} from "./routes/email.js";
import {AccessDeniedError, handleError} from "./utils/error.js";
import cors from "cors";
import {config} from "./config.js";
import {rateLimiter} from "./utils/rate-limiter.js";

const app = express();
const apiRouter = express.Router();

app.use(rateLimiter);

const allowedIps = ['127.0.0.1', '188.210.222.87'];
app.use((req, res, next) => {
    if (allowedIps.includes(req.ip)) {
        next();
    } else {
        throw new AccessDeniedError('Brak dostępu.');
    }
});

app.use(cors({origin: ['http://localhost:3000', config.APP_DOMAIN]}));

/** Depends on if app going to use url variables */
// app.use(express.urlencoded({
//     extended: true,
// }));
app.use(express.json());

app.use('/api', apiRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/login', loginRouter);
apiRouter.use('/email', mailRouter);

app.use(handleError);
const port = process.env.APP_PORT || 3001;
const hostName = config.APP_ENV === 'production' ? config.APP_IP : '127.0.0.1';
app.listen( port, hostName, () => {
    console.log(`Server listen at ${hostName} and running on port ${port}`);
});
