import { Router } from 'express';

import { UsersController } from '../controllers/UsersController';
import userValidator from '../validators/userValidator';

const app = Router();
const usersController = new UsersController();

app.post('/', userValidator, usersController.store);

export { app };
