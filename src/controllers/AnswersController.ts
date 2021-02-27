import { notFound } from '@hapi/boom';
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import SurveysUsersRepository from '../repositories/SurveysUsersRepository';

class AnswersController {
  async index(request: Request, response: Response): Promise<Response> {
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
    const surveysUsers = await surveysUsersRepository.find({
      relations: ['user', 'survey'],
    });

    return response.json(surveysUsers);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { value } = request.params;
    const { id } = request.query;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
    const surveyUser = await surveysUsersRepository.findOne({ id: String(id) });
    if (!surveyUser) {
      throw notFound('Answer not found', { code: 242 });
    }

    surveyUser.value = Number(value);
    await surveysUsersRepository.save(surveyUser);

    return response.sendStatus(204);
  }
}

export default AnswersController;
