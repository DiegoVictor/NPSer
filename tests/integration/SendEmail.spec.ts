import request from 'supertest';
import faker from 'faker';

import app from '../../src/app';
import factory from '../utils/factory';
import createConnection from '../../src/database/index';
import { getRepository } from 'typeorm';
import User from '../../src/models/User';
import Survey from '../../src/models/Survey';
import SurveyUser from '../../src/models/SurveyUser';

interface UserType {
  email: string;
}

interface SurveyType {
  id: string;
  title: string;
  description: string;
}

const transporter = {
  sendMail: jest.fn(() => ({
    messageId: faker.random.uuid(),
  })),
};
jest.mock('nodemailer', () => {
  return {
    __esModule: true,
    default: {
      createTestAccount: () => {
        return new Promise((resolve) => {
          resolve({
            smtp: {
              host: '',
              port: '',
              secure: '',
            },
            user: '',
            pass: '',
          });
        });
      },
      createTransport: () => {
        return transporter;
      },
      getTestMessageUrl: () => '',
    },
  };
});

describe('SendEmail', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
    const surveysUsersRepository = getRepository(SurveyUser);
    await surveysUsersRepository.clear();

    const usersRepository = getRepository(User);
    await usersRepository.clear();

    const surveysRepository = getRepository(Survey);
    await surveysRepository.clear();
  });

  it('should be able to send to user a survey', async () => {
    const user = await factory.attrs<UserType>('User');
    const survey = await factory.attrs<SurveyType>('Survey');

    const usersRepository = getRepository(User);
    const savedUser = usersRepository.create(user);
    await usersRepository.save(savedUser);

    const surveysRepository = getRepository(Survey);
    const savedSurvey = surveysRepository.create(survey);
    await surveysRepository.save(savedSurvey);

    const response = await request(app).post('/v1/send_mail').expect(204).send({
      email: savedUser.email,
      survey_id: savedSurvey.id,
    });

    expect(transporter.sendMail).toHaveBeenCalledWith({
      to: savedUser.email,
      subject: survey.title,
      html: expect.any(String),
      from: 'NPS <noreply@npser.com>',
    });

    const surveysUsersRepository = getRepository(SurveyUser);
    const surveyUser = await surveysUsersRepository.findOne({
      user_id: savedUser.id,
      survey_id: savedSurvey.id,
    });

    expect({ ...surveyUser }).toStrictEqual({
      id: expect.any(String),
      user_id: savedUser.id,
      survey_id: savedSurvey.id,
      value: null,
      created_at: expect.any(Date),
    });
    expect(new Date(surveyUser.created_at)).toBeTruthy();
  });
});
