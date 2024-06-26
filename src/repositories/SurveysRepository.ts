import { AppDataSource } from '../database/datasource';
import { Survey } from '../models/Survey';

const SurveysRepository = AppDataSource.getRepository(Survey);

export { SurveysRepository };
