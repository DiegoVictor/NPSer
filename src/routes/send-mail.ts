import { Router } from 'express';

import { SendMailController } from '../controllers/SendMailController';
import sendEmailValidator from '../validators/sendEmailValidator';

const app = Router();
const sendMailController = new SendMailController();

app.post('/', sendEmailValidator, sendMailController.store);

export { app };
