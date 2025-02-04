import dotenv from 'dotenv';

dotenv.config();

class ConfigVariablesClass {

  get corsOptions() {
    return {
      origin: this.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true, 
    };
  }
  
  get DB_HOST(): string {
    return process.env.DB_HOST || 'localhost';
  }

  get DB_USER(): string {
    return process.env.DB_USER || 'root';
  }

  get DB_PASSWORD(): string {
    return process.env.DB_PASSWORD || 'abc321';
  }

  get DB_NAME(): string {
    return process.env.DB_NAME || 'air_in_db';
  }

  get WEATHER_API_KEY(): string {
    return process.env.WEATHER_API_KEY || 'yourApiKey***';
  }

  get SERVER_HOSTNAME(): string {
    return process.env.SERVER_HOSTNAME || 'localhost';
  }

  get SERVER_PORT(): number {
    return process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 1111;
  }

  get JWT_SESSION_KEY(): string {
    return process.env.JWT_SESSION_KEY || 'jwtkeysession321';
  }

  get JWT_REFRESH_KEY(): string {
    return process.env.JWT_REFRESH_KEY || 'jwtkeyrefresh123';
  }

  get CORS_ORIGIN(): string {
    return process.env.CORS_ORIGIN || 'http://localhost:4200';
  }
}

export const configVariables = new ConfigVariablesClass();
