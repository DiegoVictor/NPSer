import request from 'supertest';
import { getRepository } from 'typeorm';
import faker from 'faker';

import app from '../../src/app';
import factory from '../utils/factory';
import createConnection from '../../src/database/index';
import SurveyUser from '../../src/models/SurveyUser';
import User from '../../src/models/User';
import Survey from '../../src/models/Survey';

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

  it('should be able to get survey NPS', async () => {
    const survey = await factory.attrs<SurveyType>('Survey');

    const surveysRepository = getRepository(Survey);
    const savedSurvey = surveysRepository.create(survey);
    await surveysRepository.save(savedSurvey);

    const usersRepository = getRepository(User);
    const surveysUsersRepository = getRepository(SurveyUser);

    const users = await factory.attrsMany<UserType>('User', 10);
    const promises: Promise<SurveyUserType>[] = users.map((user) => {
      return new Promise((resolve) => {
        const savedUser = usersRepository.create(user);

        usersRepository.save(savedUser).then(() => {
          factory
            .attrs<SurveyUserType>('SurveyUser', {
              user_id: savedUser.id,
              survey_id: savedSurvey.id,
            })
            .then((surveyUser) => {
              const savedSurveyUser = surveysUsersRepository.create(surveyUser);
              surveysUsersRepository.save(savedSurveyUser).then(() => {
                resolve(savedSurveyUser);
              });
            });
        });
      });
    });
    const surveysUsers = await Promise.all(promises);

    const response = await request(app)
      .get(`/v1/nps/${savedSurvey.id}`)
      .expect(200)
      .send();

    const { detractors, promoters, passive } = surveysUsers.reduce(
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
      (((promoters - detractors) / surveysUsers.length) * 100).toFixed(2)
    );

    expect(response.body).toStrictEqual({
      detractors,
      promoters,
      total: surveysUsers.length,
      passive,
      nps,
    });
  });
});
