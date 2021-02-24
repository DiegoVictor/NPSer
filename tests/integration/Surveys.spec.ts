import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factory';
import createConnection from '../../src/database/index';
import { getRepository } from 'typeorm';
import Survey from '../../src/models/Survey';

interface SurveyType {
  id?: string;
  title: string;
  description: string;
  created_at?: string;
}

describe('Surveys', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  it('should be able to get surveys', async () => {
    const surveys = await factory.attrsMany<SurveyType>('Survey', 3);

    const surveysRepository = getRepository(Survey);

    const createdSurveys = surveysRepository.create(surveys);
    await surveysRepository.save(createdSurveys);

    const response = await request(app).get('/v1/surveys');

    expect(response.body.length).toBe(3);
    createdSurveys.forEach((survey) => {
      expect(response.body).toContainEqual({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        created_at: survey.created_at.toISOString(),
      });
    });
  });

  it('should be able to create a new survey', async () => {
    const survey = await factory.attrs<SurveyType>('Survey');

    const response = await request(app)
      .post('/v1/surveys')
      .expect(201)
      .send(survey);

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      title: survey.title,
      description: survey.description,
      created_at: expect.any(String),
    });
    expect(new Date(response.body.created_at)).toBeTruthy();
  });
});
