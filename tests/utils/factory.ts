import { faker } from '@faker-js/faker';
import factory from 'factory-girl';

factory.define(
  'User',
  {},
  {
    name: faker.person.firstName,
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
    user_id: faker.string.uuid,
    survey_id: faker.string.uuid,
    value: () => faker.number.int({ min: 1, max: 10 }),
  }
);

export default factory;
