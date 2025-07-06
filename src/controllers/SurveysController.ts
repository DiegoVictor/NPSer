import { Request, Response } from 'express';
import paginationLinks from '../helpers/paginationLinks';
import { SurveysRepository } from '../repositories/SurveysRepository';

class SurveysController {
  async index(request: Request, response: Response): Promise<void> {
    const { currentUrl } = request;
    const { page = 1 } = request.query;
    const limit = 10;

    const surveys = await SurveysRepository.find({
      take: limit,
      skip: (Number(page) - 1) * limit,
      order: { id: 'ASC' },
    });

    const count = await SurveysRepository.count();
    response.header('X-Total-Count', count.toString());

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      response.links(paginationLinks(Number(page), pages_total, currentUrl));
    }

    response.json(surveys);
  }

  async store(request: Request, response: Response): Promise<void> {
    const { title, description } = request.body;

    const survey = SurveysRepository.create({ title, description });
    await SurveysRepository.save(survey);

    response.status(201).json(survey);
  }
}

export { SurveysController };
