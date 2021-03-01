import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import paginationLinks from '../helpers/paginationLinks';
import SurveysRepository from '../repositories/SurveysRepository';

class SurveysController {
  async index(request: Request, response: Response): Promise<Response> {
    const { currentUrl } = request;
    const { page = 1 } = request.query;
    const limit = 10;

    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveys = await surveysRepository.find({
      take: limit,
      skip: (Number(page) - 1) * limit,
    });

    const count = await surveysRepository.count();
    response.header('X-Total-Count', count.toString());

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(Number(page), pages_total, currentUrl));
    }

    return response.json(surveys);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { title, description } = request.body;

    const surveysRepository = getCustomRepository(SurveysRepository);

    const survey = surveysRepository.create({ title, description });
    await surveysRepository.save(survey);

    return response.status(201).json(survey);
  }
}

export default SurveysController;
