import { notFound } from '@hapi/boom';
import { Request, Response } from 'express';
import paginationLinks from '../helpers/paginationLinks';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class AnswersController {
  async index(request: Request, response: Response): Promise<void> {
    const { currentUrl } = request;
    const { page = 1 } = request.query;
    const limit = 10;

    const surveysUsers = await SurveysUsersRepository.find({
      relations: ['user', 'survey'],
      take: limit,
      skip: (Number(page) - 1) * limit,
      order: { id: 'ASC' },
    });

    const count = await SurveysUsersRepository.count();
    response.header('X-Total-Count', count.toString());

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(Number(page), pages_total, currentUrl));
    }

    response.json(surveysUsers);
  }

  async store(request: Request, response: Response): Promise<void> {
    const { value } = request.params;
    const { id } = request.query;

    const surveyUser = await SurveysUsersRepository.findOne({
      where: { id: String(id) },
    });
    if (!surveyUser) {
      throw notFound('Answer not found', { code: 242 });
    }

    surveyUser.value = Number(value);
    await SurveysUsersRepository.save(surveyUser);

    response.sendStatus(204);
  }
}

export { AnswersController };
