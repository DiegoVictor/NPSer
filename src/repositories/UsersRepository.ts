import { AppDataSource } from '../database/datasource';
import { User } from '../models/User';

const UsersRepository = AppDataSource.getRepository(User);

export { UsersRepository };
