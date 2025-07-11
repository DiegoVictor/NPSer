import request from 'supertest';
import app from '../../src/app';
import factory from '../utils/factory';
import { Survey } from '../../src/models/Survey';
import { JestDatasource } from '../utils/datasource';
import { IsNull, Not } from 'typeorm';

interface SurveyType {
  id?: string;
  title: string;
  description: string;
  created_at?: string;
}

describe('Surveys', () => {
  const datasource = new JestDatasource();

  beforeAll(async () => {
    const connection = await datasource.getConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
    const connection = await datasource.getConnection();

    const surveysRepository = connection.getRepository(Survey);
    await surveysRepository.delete({
      id: Not(IsNull()),
    });
  });

  afterAll(async () => {
    const connection = await datasource.getConnection();

    await connection.dropDatabase();
    await connection.destroy();
  });

  it('should be able to get surveys', async () => {
    const surveys = await factory.attrsMany<SurveyType>('Survey', 3);

    const connection = await datasource.getConnection();
    const surveysRepository = connection.getRepository(Survey);

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

  it('should be able the second page of surveys', async () => {
    const surveys = await factory.attrsMany<SurveyType>('Survey', 20);

    const connection = await datasource.getConnection();
    const surveysRepository = connection.getRepository(Survey);

    const createdSurveys = surveysRepository.create(surveys);
    await surveysRepository.save(createdSurveys);

    const response = await request(app).get('/v1/surveys?page=2');

    expect(response.body.length).toBe(10);
    createdSurveys
      .sort((a, b) => {
        if (a.id > b.id) {
          return 1;
        } else if (b.id > a.id) {
          return -1;
        }
        return 0;
      })
      .slice(-10)
      .forEach((survey) => {
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

    delete survey.id;

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
