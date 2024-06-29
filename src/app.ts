import 'dotenv/config';
import 'express-async-errors';
import 'reflect-metadata';

import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isBoom } from '@hapi/boom';
import { errors } from 'celebrate';

import './database/datasource';
import { app as routes } from './routes';
import RouteAliases from './middlewares/RouteAliases';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(RouteAliases);

app.use('/v1', routes);

app.use(errors());
app.use(
  async (err: Error, request: Request, res: Response, next: NextFunction) => {
    if (isBoom(err)) {
      const { statusCode, payload } = err.output;

      return res.status(statusCode).json({
        ...payload,
        ...err.data,
        docs: process.env.DOCS_URL,
      });
    }

    return next(err);
  }
);

export default app;
