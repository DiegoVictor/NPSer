import { IsNull, Not, Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { SurveyUser } from '../models/SurveyUser';


const SurveysUsersRepository = AppDataSource.getRepository(SurveyUser);

export { SurveysUsersRepository };
