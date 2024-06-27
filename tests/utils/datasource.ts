import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/database/datasource';

class JestDatasource {
  private datasource: DataSource;

  public async getConnection() {
    if (!AppDataSource.isInitialized) {
      this.datasource = await AppDataSource.initialize();
    }

    if (!this.datasource) {
      this.datasource = AppDataSource.manager.connection;
    }

    return this.datasource;
  }
}

export { JestDatasource };
