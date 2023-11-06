import Router from 'express';

export const loginRouter = Router();

loginRouter.get('/', (req, res) => {

    res.send('login');
})