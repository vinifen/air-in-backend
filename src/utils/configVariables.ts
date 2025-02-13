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
  get CORS_ORIGIN(): string {
    return process.env.CORS_ORIGIN || 'error CORS_ORIGIN';
  }


  get DB_HOST(): string {
    return process.env.DB_HOST || 'error DB_HOST';
  }
  get DB_USER(): string {
    return process.env.DB_USER || 'error DB_USER';
  }
  get DB_PASSWORD(): string {
    return process.env.DB_PASSWORD || 'error DB_PASSWORD';
  }
  get DB_NAME(): string {
    return process.env.DB_NAME || 'error DB_NAME';
  }


  get WEATHER_API_KEY(): string {
    return process.env.WEATHER_API_KEY || 'error WEATHER_API_KEY';
  }


  get SERVER_HOSTNAME(): string {
    return process.env.SERVER_HOSTNAME || 'error SERVER_HOSTNAME';
  }
  get SERVER_PORT(): number {
    return process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 0;
  }


  get JWT_SESSION_KEY(): string {
    return process.env.JWT_SESSION_KEY || 'error JWT_SESSION_KEY';
  }
  get JWT_REFRESH_KEY(): string {
    return process.env.JWT_REFRESH_KEY || 'error JWT_REFRESH_KEY';
  }

  get COOKIE_SECURE(): boolean{
    const cookieSecureBinary = process.env.COOKIE_SECURE ? parseInt(process.env.COOKIE_SECURE) : 402;
    if(cookieSecureBinary === 0){
      return false;
    }
    if(cookieSecureBinary === 1){
      return true;
    }
    console.error("Cookie secure not defined, default value: false");
    return false;
  }
}

export const configVariables = new ConfigVariablesClass();