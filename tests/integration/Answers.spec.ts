import request from 'supertest';
import faker from 'faker';
import { getRepository } from 'typeorm';

import app from '../../src/app';
import factory from '../utils/factory';
import createConnection from '../../src/database/index';
import Survey from '../../src/models/Survey';
import SurveyUser from '../../src/models/SurveyUser';
import User from '../../src/models/User';

interface UserType {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

interface SurveyType {
  id: string;
  title: string;
  description: string;
  created_at: Date;
}

interface SurveyUserType {
  id: string;
  user_id: string;
  survey_id: string;
  value: number;
  created_at: Date;
}

describe('Users', () => {
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

  afterAll(async () => {
    const connection = await createConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get answers list', async () => {
    const usersRepository = getRepository(User);
    const surveysUsersRepository = getRepository(SurveyUser);
    const surveysRepository = getRepository(Survey);

    const users = await factory.attrsMany<UserType>('User', 3);
    const promises: Promise<{
      user: UserType;
      survey: SurveyType;
      surveyUser: SurveyUserType;
    }>[] = users.map((user) => {
      return new Promise((resolve) => {
        const savedUser = usersRepository.create(user);

        usersRepository.save(savedUser).then(() => {
          factory.attrs<SurveyType>('Survey').then((survey) => {
            const savedSurvey = surveysRepository.create(survey);

            surveysRepository.save(savedSurvey).then(() => {
              factory
                .attrs<SurveyUserType>('SurveyUser', {
                  user_id: savedUser.id,
                  survey_id: savedSurvey.id,
                })
                .then((surveyUser) => {
                  const savedSurveyUser = surveysUsersRepository.create(
                    surveyUser
                  );

                  surveysUsersRepository.save(savedSurveyUser).then(() => {
                    resolve({
                      user: savedUser,
                      survey: savedSurvey,
                      surveyUser: savedSurveyUser,
                    });
                  });
                });
            });
          });
        });
      });
    });
    const surveysUsers = await Promise.all(promises);

    const response = await request(app).get(`/v1/answers`).expect(200);

    surveysUsers.slice(-10).forEach(({ survey, surveyUser, user }) => {
      expect(response.body).toContainEqual({
        ...surveyUser,
        created_at: surveyUser.created_at.toISOString(),
        user: {
          ...user,
          created_at: user.created_at.toISOString(),
        },
        survey: {
          ...survey,
          created_at: survey.created_at.toISOString(),
        },
      });
    });
  });

  it('should be able to get the second page of answers', async () => {
    const usersRepository = getRepository(User);
    const surveysUsersRepository = getRepository(SurveyUser);
    const surveysRepository = getRepository(Survey);

    const users = await factory.attrsMany<UserType>('User', 20);
    const promises: Promise<{
      user: UserType;
      survey: SurveyType;
      surveyUser: SurveyUserType;
    }>[] = users.map((user) => {
      return new Promise((resolve) => {
        const savedUser = usersRepository.create(user);

        usersRepository.save(savedUser).then(() => {
          factory.attrs<SurveyType>('Survey').then((survey) => {
            const savedSurvey = surveysRepository.create(survey);

            surveysRepository.save(savedSurvey).then(() => {
              factory
                .attrs<SurveyUserType>('SurveyUser', {
                  user_id: savedUser.id,
                  survey_id: savedSurvey.id,
                })
                .then((surveyUser) => {
                  const savedSurveyUser = surveysUsersRepository.create(
                    surveyUser
                  );

                  surveysUsersRepository.save(savedSurveyUser).then(() => {
                    resolve({
                      user: savedUser,
                      survey: savedSurvey,
                      surveyUser: savedSurveyUser,
                    });
                  });
                });
            });
          });
        });
      });
    });
    const surveysUsers = await Promise.all(promises);

    const response = await request(app).get(`/v1/answers?page=2`).expect(200);

    surveysUsers
      .sort((a, b) => {
        if (a.surveyUser.id > b.surveyUser.id) {
          return 1;
        } else if (a.surveyUser.id < b.surveyUser.id) {
          return -1;
        }
        return 0;
      })
      .slice(-10)
      .forEach(({ survey, surveyUser, user }) => {
        expect(response.body).toContainEqual({
          ...surveyUser,
          created_at: surveyUser.created_at.toISOString(),
          user: {
            ...user,
            created_at: user.created_at.toISOString(),
          },
          survey: {
            ...survey,
            created_at: survey.created_at.toISOString(),
          },
        });
      });
  });

  it('should be able to answer a survey', async () => {
    const user = await factory.attrs<UserType>('User');
    const survey = await factory.attrs<SurveyType>('Survey');

    const usersRepository = getRepository(User);
    const savedUser = usersRepository.create(user);
    await usersRepository.save(savedUser);

    const surveysRepository = getRepository(Survey);
    const savedSurvey = surveysRepository.create(survey);
    await surveysRepository.save(savedSurvey);

    const surveyUser = await factory.attrs<SurveyUserType>('SurveyUser', {
      user_id: savedUser.id,
      survey_id: savedSurvey.id,
      value: null,
    });
    const surveysUsersRepository = getRepository(SurveyUser);
    const savedSurveyUser = surveysUsersRepository.create(surveyUser);
    await surveysUsersRepository.save(savedSurveyUser);

    const value = faker.datatype.number({ min: 1, max: 10 });
    await request(app)
      .get(`/v1/answers/${value}?id=${savedSurveyUser.id}`)
      .expect(204)
      .send();

    const updatedSurveyUser = await surveysUsersRepository.findOne(
      savedSurveyUser.id
    );

    expect(updatedSurveyUser.value).toBe(value);
  });

  it('should not be able to answer a survey that not exists', async () => {
    const value = faker.datatype.number({ min: 1, max: 10 });
    const id = faker.datatype.uuid();

    const response = await request(app)
      .get(`/v1/answers/${value}?id=${id}`)
      .expect(404)
      .send();

    expect(response.body).toStrictEqual({
      statusCode: 404,
      code: 242,
      error: 'Not Found',
      message: 'Answer not found',
      docs: process.env.DOCS_URL,
    });
  });
});
