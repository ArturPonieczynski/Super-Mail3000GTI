import express from "express";
import "express-async-errors";
import {homeRouter} from "./routes/home.js";
import {loginRouter} from "./routes/login.js";
import {mailRouter} from "./routes/mail.js";
import {handleError} from "./utils/error.js";
import cors from "cors";
import {config} from "./config.js";
// import methodOverride from "method-override";

const app = express();

const apiRouter = express.Router();

// const allowedHostname = ['supermail3000git.pl', 'localhost'];
// app.use((req, res, next) => {
//     console.log(req.hostname);
//     const clientIp = req.hostname;
//     if (allowedHostname.includes(clientIp)) {
//         next();
//     } else {
//         res.status(403).send('Access denied');
//     }
// });

app.use(cors({origin: ['http://localhost:3000', config.APP_DOMAIN]}));

/** Prepared method-override for future form action method PUT/PATCH/DELETE */
// app.use(methodOverride('_method'));
/** Depends on if app going to use url variables */
// app.use(express.urlencoded({
//     extended: true,
// }));
app.use(express.json());

app.use('/api', apiRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/login', loginRouter);
apiRouter.use('/mail', mailRouter);

app.use(handleError);
const port = process.env.APP_PORT || 3001;
app.listen( port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});