import { Router } from 'express';

import SurveysController from './controllers/SurveysController';
import UsersController from './controllers/UsersController';
import SendMailController from './controllers/SendMailController';
import NpsController from './controllers/NpsController';
import userValidator from './validators/userValidator';
import npsValidator from './validators/npsValidator';

const routes = Router();

const usersController = new UsersController();
const surveysController = new SurveysController();
const sendMailController = new SendMailController();
const npsController = new NpsController();

routes.post('/users', userValidator, usersController.store);

routes.get('/surveys', surveysController.index);
routes.post('/surveys', surveyValidator, surveysController.store);

routes.post('/send_mail', sendEmailValidator, sendMailController.store);

routes.get('/nps/:survey_id', npsValidator, npsController.show);

export default routes;
