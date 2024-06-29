import { Router } from 'express';

import { app as users } from './users';
import { app as surveys } from './surveys';
import { app as answers } from './answers';
import { app as nps } from './nps';
import { app as sendMail } from './send-mail';

const app = Router();

app.use('/users', users);
app.use('/surveys', surveys);

app.use('/send_mail', sendMail);

app.use('/answers', answers);
app.use('/nps', nps);

export { app };
