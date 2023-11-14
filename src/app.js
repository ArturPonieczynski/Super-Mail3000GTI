import express from 'express';
import {homeRouter} from "./routes/home.js";
import {loginRouter} from "./routes/login.js";
import {mailRouter} from "./routes/mail.js";

const app = express();

const apiRouter = express.Router();

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());

app.use('/api', apiRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/login', loginRouter);
apiRouter.use('/mail', mailRouter);
app.all('/', (req, res) => {
    console.log(req.ips);

    res.send('<h1>Super Mail 3000 GTI</h1>\n' +
        '<p>Wiadomości są wysyłane jako info@sailinglegia.pl</p>\n' +
        '<form action="/api/mail" method="POST" enctype="multipart/form-data">\n' +
        '    <label>\n' +
        '        <p>e-mail</p>\n' +
        '        <input type="text" name="mailTo" required>\n' +
        '    </label>\n' +
        '    <label title="Temat">\n' +
        '        <p>Temat</p>\n' +
        '        <input type="text" name="subject" required>\n' +
        '    </label>\n' +
        '    <label>\n' +
        '        <p>Tekst</p>\n' +
        '        <textarea cols="90" rows="10" name="text" required></textarea>\n' +
        '    </label>\n' +
        '    <label>\n' +
        '        <p>Dodaj plik</p>\n' +
        '        <input name="file" type="file">\n' +
        '    </label>\n' +
        '    <br><br>\n' +
        '    <p>Jeśli nie wybierzesz daty i godziny, mail wyślę się natychmiast.</p>\n' +
        '    <input type="date" name="date">\n' +
        '    <br><br>\n' +
        '    <input type="time" name="time">\n' +
        '    <br><br>\n' +
        '    <button type="submit" style="background-color: red">Wyślij mail</button>\n' +
        '</form>');

});

// app.use(handleError);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});