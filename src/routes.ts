import { Router } from 'express';

import SurveysController from './controllers/SurveysController';
import UsersController from './controllers/UsersController';
import SendMailController from './controllers/SendMailController';
import userValidator from './validators/userValidator';

const routes = Router();

const usersController = new UsersController();
const surveysController = new SurveysController();
const sendMailController = new SendMailController();

routes.post('/users', userValidator, usersController.store);

routes.get('/surveys', surveysController.index);
routes.post('/surveys', surveyValidator, surveysController.store);

routes.post('/send_mail', sendMailController.store);

export default routes;
