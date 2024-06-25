import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database:
    process.env.NODE_ENV === 'test'
      ? './src/database/test.sqlite'
      : './src/database/database.sqlite',
  entities: ['./src/models/**.ts'],
  migrations: ['./src/database/migrations/*.ts'],
});

AppDataSource.initialize();

export { AppDataSource };
