import request from 'supertest';
import app from '../../src/app';
import factory from '../utils/factory';
import { User } from '../../src/models/User';
import { JestDatasource } from '../utils/datasource';
import { IsNull, Not } from 'typeorm';

interface UserType {
  id?: string;
  name: string;
  email: string;
  created_at?: string;
}

describe('Users', () => {
  const datasource = new JestDatasource();

  beforeAll(async () => {
    const connection = await datasource.getConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
    const connection = await datasource.getConnection();

    const usersRepository = connection.getRepository(User);
    await usersRepository.delete({
      id: Not(IsNull()),
    });
  });

  afterAll(async () => {
    const connection = await datasource.getConnection();

    await connection.dropDatabase();
    await connection.destroy();
  });

  it('should be able to create a new user', async () => {
    const user = await factory.attrs<UserType>('User');

    delete user.id;

    const response = await request(app)
      .post('/v1/users')
      .expect(201)
      .send(user);

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      name: user.name,
      email: user.email,
      created_at: expect.any(String),
    });
    expect(new Date(response.body.created_at)).toBeTruthy();
  });

  it('should not be able to create an user with existing email', async () => {
    const user = await factory.attrs<UserType>('User');

    const connection = await datasource.getConnection();
    const usersRepository = connection.getRepository(User);
    await usersRepository.save(usersRepository.create(user));

    delete user.id;

    const response = await request(app)
      .post('/v1/users')
      .expect(400)
      .send(user);

    expect(response.body).toStrictEqual({
      code: 140,
      docs: process.env.DOCS_URL,
      error: 'Bad Request',
      message: 'User already exists',
      statusCode: 400,
    });
  });
});
