import { IsNull, Not, Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { SurveyUser } from '../models/SurveyUser';

export type ISurveysUsersRepository = Repository<SurveyUser> & {
  getAnswers: () => Promise<SurveyUser[]>;
};

const SurveysUsersRepository = AppDataSource.getRepository(SurveyUser).extend({
  async getAnswers(survey_id: string): Promise<SurveyUser[]> {
    return this.createQueryBuilder('surveys_users')
      .where({
        survey_id,
        value: Not(IsNull()),
      })
      .getMany();
  },
});

export { SurveysUsersRepository };
