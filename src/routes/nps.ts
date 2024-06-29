import { Router } from 'express';

import { NpsController } from '../controllers/NpsController';
import npsValidator from '../validators/npsValidator';

const app = Router();
const npsController = new NpsController();

app.get('/:survey_id', npsValidator, npsController.show);

export { app };
