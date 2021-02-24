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

export default factory;
