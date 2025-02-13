import mysql, { RowDataPacket } from "mysql2";

export default class DbService {
  private pool: mysql.Pool;

  constructor(
    dbHost: string,
    dbUser: string,
    dbPassword: string,
    dbName: string
  ) {
    this.pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 100
    });
  }

  private async getConnection(): Promise<mysql.PoolConnection> {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  }

  async getQuery(sql: string, values: any[] = []): Promise<RowDataPacket[]> {
    const conn = await this.getConnection();

    return new Promise((resolve, reject) => {
      conn.query<RowDataPacket[]>(sql, values, (err, results) => {
        conn.release(); 
        if (err) {
          console.error(
            `[MySQL Query Error in getQuery:] Failed to execute query: ${sql} with values: ${JSON.stringify(
              values
            )}. Error:`,
            err
          );
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  async getExecute(sql: string, values: any[] = []): Promise<RowDataPacket[]> {
    const conn = await this.getConnection();

    return new Promise((resolve, reject) => {
      conn.execute<RowDataPacket[]>(sql, values, (err, results) => {
        conn.release();
        if (err) {
          console.error(
            `[MySQL Execute Error in getExecute:] Failed to execute statement: ${sql} with values: ${JSON.stringify(
              values
            )}. Error:`,
            err
          );
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}
