import { faker } from '@faker-js/faker';
import factory from 'factory-girl';

factory.define(
  'User',
  {},
  {
    name: faker.name.findName,
    email: faker.internet.email,
  }
);

factory.define(
  'Survey',
  {},
  {
    title: faker.lorem.words,
    description: faker.lorem.paragraph,
  }
);

factory.define(
  'SurveyUser',
  {},
  {
    user_id: faker.datatype.uuid,
    survey_id: faker.datatype.uuid,
    value: () => faker.datatype.number({ min: 1, max: 10 }),
  }
);

export default factory;
