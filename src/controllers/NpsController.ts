import { Request, Response } from 'express';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class NpsController {
  async show(request: Request, response: Response) {
    const { survey_id } = request.params;

    const answers = await SurveysUsersRepository.getAnswers(survey_id);

    const { detractors, promoters, passive } = answers.reduce(
      (prev, answer) => {
        if (answer.value >= 9) {
          prev.promoters++;
        } else if (answer.value <= 6) {
          prev.detractors++;
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

export { NpsController };
