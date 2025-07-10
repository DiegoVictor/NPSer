import { faker } from '@faker-js/faker';
import factory from 'factory-girl';

factory.define(
  'User',
  {},
  {
    id: faker.string.uuid,
    name: faker.person.firstName,
    email: faker.internet.email,
  }
);

factory.define(
  'Survey',
  {},
  {
    id: faker.string.uuid,
    title: faker.lorem.words,
    description: faker.lorem.paragraph,
  }
);

factory.define(
  'SurveyUser',
  {},
  {
    id: faker.string.uuid,
    user_id: faker.string.uuid,
    survey_id: faker.string.uuid,
    value: () => faker.number.int({ min: 1, max: 10 }),
  }
);

export default factory;
