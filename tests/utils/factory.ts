import faker from 'faker';
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
    title: faker.name.title,
    description: faker.lorem.paragraph,
  }
);

factory.define(
  'SurveyUser',
  {},
  {
    user_id: faker.random.uuid,
    survey_id: faker.random.uuid,
    value: () => faker.random.number({ min: 1, max: 10 }),
  }
);

export default factory;
