import { Router } from 'express';

import { SurveysController } from '../controllers/SurveysController';
import surveyValidator from '../validators/surveyValidator';
import pageValidator from '../validators/pageValidator';

const app = Router();
const surveysController = new SurveysController();

app.get('/', pageValidator, surveysController.index);
app.post('/', surveyValidator, surveysController.store);

export { app };
