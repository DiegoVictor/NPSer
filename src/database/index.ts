import { Connection, createConnection, getConnection, getConnectionOptions, getConnectionManager } from 'typeorm';

const connectionName = 'default';
export default async (): Promise<Connection> => {
  const manager = getConnectionManager();

  if (manager.has(connectionName)) {
    const connection = manager.get(connectionName);
    if (!connection.isConnected) {
      await connection.connect();
    }

    return connection;
  }

  const defaultOptions = await getConnectionOptions();
  return createConnection(
    Object.assign(defaultOptions, {
      database:
        process.env.NODE_ENV === 'test'
          ? './src/database/database.test.sqlite'
          : defaultOptions.database,
    })
  );
};
