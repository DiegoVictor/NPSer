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

    const sendMail = new SendMailService();
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      user_id: user.id,
      link: `${process.env.URL_MAIL}`,
    };
    const npsPath = path.resolve(__dirname, '..', 'views', 'emails', 'nps.hbs');

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{ user_id: user.id }, { value: null }],
      relations: ['user', 'survey'],
    });
    if (surveyUserAlreadyExists) {
      await sendMail.execute(email, survey.title, variables, npsPath);
    } else {
      await sendMail.execute(email, survey.title, variables, npsPath);

      const surveyUser = surveysUsersRepository.create({
        user_id: user.id,
        survey_id,
      });
      await surveysUsersRepository.save(surveyUser);
    }

    return response.status(204);
  }
}

export default SendMailController;
