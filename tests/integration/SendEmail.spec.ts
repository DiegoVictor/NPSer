import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../../src/app';
import factory from '../utils/factory';
import { User } from '../../src/models/User';
import { Survey } from '../../src/models/Survey';
import { SurveyUser } from '../../src/models/SurveyUser';
import { JestDatasource } from '../utils/datasource';

interface UserType {
  email: string;
}

interface SurveyType {
  id: string;
  title: string;
  description: string;
}

interface SurveyUserType {
  id: string;
  user_id: string;
  survey_id: string;
  value: number;
}

const transporter = {
  sendMail: jest.fn(() => ({
    messageId: faker.string.uuid(),
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
  const datasource = new JestDatasource();

  beforeAll(async () => {
    const connection = await datasource.getConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
    const connection = await datasource.getConnection();

    for (const entity of [SurveyUser, User, Survey]) {
      await connection.getRepository(entity).delete({});
    }
  });

  afterAll(async () => {
    const connection = await datasource.getConnection();

    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to send to user a survey', async () => {
    const user = await factory.attrs<UserType>('User');
    const survey = await factory.attrs<SurveyType>('Survey');

    const connection = await datasource.getConnection();

    const usersRepository = connection.getRepository(User);
    const savedUser = usersRepository.create(user);
    await usersRepository.save(savedUser);

    const surveysRepository = connection.getRepository(Survey);
    const savedSurvey = surveysRepository.create(survey);
    await surveysRepository.save(savedSurvey);

    jest.spyOn(console, 'log').mockImplementation(() => {});

    await request(app).post('/v1/send_mail').expect(201).send({
      email: savedUser.email,
      survey_id: savedSurvey.id,
    });

    expect(transporter.sendMail).toHaveBeenCalledWith({
      to: savedUser.email,
      subject: survey.title,
      html: expect.any(String),
      from: 'NPS <noreply@npser.com>',
    });

    const surveysUsersRepository = connection.getRepository(SurveyUser);
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

  it('should be able to resend to user a previous survey', async () => {
    const user = await factory.attrs<UserType>('User');
    const survey = await factory.attrs<SurveyType>('Survey');

    const connection = await datasource.getConnection();

    const usersRepository = connection.getRepository(User);
    const savedUser = usersRepository.create(user);
    await usersRepository.save(savedUser);

    const surveysRepository = connection.getRepository(Survey);
    const savedSurvey = surveysRepository.create(survey);
    await surveysRepository.save(savedSurvey);

    const surveyUser = await factory.attrs<SurveyUserType>('SurveyUser', {
      user_id: savedUser.id,
      survey_id: savedSurvey.id,
      value: null,
    });
    const surveysUsersRepository = connection.getRepository(SurveyUser);
    const savedSurveyUser = surveysUsersRepository.create(surveyUser);
    await surveysUsersRepository.save(savedSurveyUser);

    await request(app).post('/v1/send_mail').expect(201).send({
      email: savedUser.email,
      survey_id: savedSurvey.id,
    });

    expect(transporter.sendMail).toHaveBeenCalledWith({
      to: savedUser.email,
      subject: survey.title,
      html: expect.any(String),
      from: 'NPS <noreply@npser.com>',
    });

    const updatedSurveyUser = await surveysUsersRepository.findOne(
      savedSurveyUser.id
    );

    expect({ ...updatedSurveyUser }).toStrictEqual({
      id: savedSurveyUser.id,
      user_id: savedUser.id,
      survey_id: savedSurvey.id,
      value: savedSurveyUser.value,
      created_at: savedSurveyUser.created_at,
    });
  });

  it('should not be able to send to user that not exists a survey', async () => {
    const email = faker.internet.email();
    const survey_id = faker.string.uuid();

    const response = await request(app).post('/v1/send_mail').expect(400).send({
      email,
      survey_id,
    });

    expect(transporter.sendMail).not.toHaveBeenCalled();

    const connection = await datasource.getConnection();

    const surveysUsersRepository = connection.getRepository(SurveyUser);
    const surveysUsersRepository = getRepository(SurveyUser);
    const surveyUser = await surveysUsersRepository.findOne({ survey_id });

    expect(surveyUser).toBeFalsy();
    expect(response.body).toStrictEqual({
      statusCode: 400,
      code: 240,
      error: 'Bad Request',
      message: 'User does not exists',
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to send to user a survey that not exists', async () => {
    const user = await factory.attrs<UserType>('User');

    const connection = await datasource.getConnection();

    const usersRepository = connection.getRepository(User);
    const savedUser = usersRepository.create(user);
    await usersRepository.save(savedUser);

    const survey_id = faker.string.uuid();

    const response = await request(app).post('/v1/send_mail').expect(400).send({
      email: user.email,
      survey_id,
    });

    expect(transporter.sendMail).not.toHaveBeenCalled();

    const surveysUsersRepository = connection.getRepository(SurveyUser);
    const surveysUsersRepository = getRepository(SurveyUser);
    const surveyUser = await surveysUsersRepository.findOne({ survey_id });

    expect(surveyUser).toBeFalsy();
    expect(response.body).toStrictEqual({
      statusCode: 400,
      code: 241,
      error: 'Bad Request',
      message: 'Survey does not exists',
      docs: process.env.DOCS_URL,
    });
  });
});
