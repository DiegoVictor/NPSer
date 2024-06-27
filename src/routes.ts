import { Router } from 'express';

import { SurveysController } from './controllers/SurveysController';
import { UsersController } from './controllers/UsersController';
import { SendMailController } from './controllers/SendMailController';
import { AnswersController } from './controllers/AnswersController';
import { NpsController } from './controllers/NpsController';
import userValidator from './validators/userValidator';
import surveyValidator from './validators/surveyValidator';
import sendEmailValidator from './validators/sendEmailValidator';
import npsValidator from './validators/npsValidator';
import answerValidator from './validators/answerValidator';
import pageValidator from './validators/pageValidator';

const app = Router();

const usersController = new UsersController();
const surveysController = new SurveysController();
const sendMailController = new SendMailController();
const answersController = new AnswersController();
const npsController = new NpsController();

app.post('/users', userValidator, usersController.store);

app.get('/surveys', pageValidator, surveysController.index);
app.post('/surveys', surveyValidator, surveysController.store);

app.post('/send_mail', sendEmailValidator, sendMailController.store);

app.get('/answers', pageValidator, answersController.index);
app.get('/answers/:value', answerValidator, answersController.store);

app.get('/nps/:survey_id', npsValidator, npsController.show);

export default app;
