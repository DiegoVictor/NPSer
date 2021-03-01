import { Request, Response } from 'express';
import { getCustomRepository, IsNull, Not } from 'typeorm';

import SurveysUsersRepository from '../repositories/SurveysUsersRepository';

class NpsController {
  async show(request: Request, response: Response) {
    const { survey_id } = request.params;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
    const answers = await surveysUsersRepository.find({
      survey_id,
      value: Not(IsNull()),
    });

    const { detractors, promoters, passive } = answers.reduce(
      (prev, answer) => {
        if (answer.value >= 0 && answer.value <= 6) {
          prev.detractors++;
        } else if (answer.value >= 9 && answer.value <= 10) {
          prev.promoters++;
        } else {
          prev.passive++;
        }
        return prev;
      },
      { detractors: 0, promoters: 0, passive: 0 }
    );

    const nps = Number(
      (((promoters - detractors) / answers.length) * 100).toFixed(2)
    );

    return response.json({
      promoters,
      detractors,
      passive,
      total: answers.length,
      nps,
    });
  }
}

export default NpsController;
