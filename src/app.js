import express from "express";
import "express-async-errors";
import {homeRouter} from "./routes/home.js";
import {loginRouter} from "./routes/login.js";
import {mailRouter} from "./routes/mail.js";
import {handleError} from "./utils/error.js";
import cors from "cors";
// import methodOverride from "method-override";

const app = express();

const apiRouter = express.Router();

app.use(cors({origin: 'http://localhost:3000'}));

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
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});