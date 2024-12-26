import mysql, { RowDataPacket } from "mysql2";

export class DbService {
  private conn: mysql.Connection;

  constructor(dbHost: string, dbUser: string, dbPassword: string, dbName: string,) {
    this.conn = mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
  }

  async getQuery(sql: string, values: any[] = []): Promise<RowDataPacket[]> {
    return new Promise((resolve, reject) => {
      this.conn.query<RowDataPacket[]>(sql, values, (err, results) => {
        if (err) {
          console.error(`[MySQL Query Error in getQuery:] Failed to execute query: ${sql} with values: ${JSON.stringify(values)}. Error:`, err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  async getExecute(sql: string, values: any[] = []): Promise<RowDataPacket[]> {
    return new Promise((resolve, reject) => {
      this.conn.execute<RowDataPacket[]>(sql, values, (err, results) => {
        if (err) {
          console.error(`[MySQL Execute Error in getExecute:] Failed to execute statement: ${sql} with values: ${JSON.stringify(values)}. Error:`, err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  async getClose() {
    return new Promise<void>((resolve, reject) => {
      this.conn.end(err => {
        if (err) {
          console.error("[MySQL Close Error in getClose:] Failed to close the connection pool. Error:", err);
          reject(err);
        } else {
          console.log("Mysql closed");
          resolve();
        }
      });
    });
  }
}

