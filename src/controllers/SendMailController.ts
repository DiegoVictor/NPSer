import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import path from 'path';

import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUsersRepository from '../repositories/SurveysUsersRepository';
import UsersRepository from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';

class SendMailController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);

    const user = await usersRepository.findOne({ email });
    if (!user) {
      throw badRequest('User does not exists', { code: 240 });
    }

    const survey = await surveysRepository.findOne({
      id: survey_id,
    });
    if (!survey) {
      throw badRequest('Survey does not exists', { code: 241 });
    }

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
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

      return response.json({
        id: surveyUserAlreadyExists.id,
      });
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    });
    await surveysUsersRepository.save(surveyUser);

    variables.id = surveyUser.id;

    await sendMail.execute(email, survey.title, variables, npsPath);

    return response.status(201).json({
      id: surveyUser.id,
    });
  }
}

export default SendMailController;
