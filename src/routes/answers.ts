import { Router } from 'express';

import { AnswersController } from '../controllers/AnswersController';
import answerValidator from '../validators/answerValidator';
import pageValidator from '../validators/pageValidator';

const app = Router();
const answersController = new AnswersController();

app.get('/', pageValidator, answersController.index);
app.get('/:value', answerValidator, answersController.store);

export { app };
