import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import path from 'path';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';

class SendMailController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, survey_id } = request.body;

    const user = await UsersRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw badRequest('User does not exists', { code: 240 });
    }

    const survey = await SurveysRepository.findOne({
      where: {
        id: survey_id,
      },
    });
    if (!survey) {
      throw badRequest('Survey does not exists', { code: 241 });
    }

    const surveyUserAlreadyExists = await SurveysUsersRepository.findOne({
      where: { user_id: user.id, value: null },
    });

    const variables = {
      name: user.name,
      title: survey.title,
      id: null,
      description: survey.description,
      link: `${process.env.URL_MAIL}`,
    };
    const npsPath = path.resolve(__dirname, '..', 'views', 'emails', 'nps.hbs');

    const sendMail = new SendMailService();
    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await sendMail.execute(email, survey.title, variables, npsPath);

      return response.status(201).json({
        id: surveyUserAlreadyExists.id,
      });
    }

    const surveyUser = SurveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    });
    await SurveysUsersRepository.save(surveyUser);

    variables.id = surveyUser.id;

    await sendMail.execute(email, survey.title, variables, npsPath);

    return response.status(201).json({
      id: surveyUser.id,
    });
  }
}

export { SendMailController };
