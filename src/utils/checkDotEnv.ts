import fs from 'fs';

export default function checkDotEnv(){
  if (!fs.existsSync('.env')) {
    console.error(`
      ========================================================
      [ALERT:] .env file is missing!
      
      For improved security and to prevent potential errors, 
      please create a .env file in the root of the project with
      the following variables (example values are provided):
  
      SERVER_HOSTNAME=localhost
      SERVER_PORT=1111

      DB_HOST=127.0.0.1
      DB_USER=root
      DB_PASSWORD=abc321
      DB_NAME=air_in_db

      CORS_ORIGIN=http://localhost:4200

      WEATHER_API_KEY=apikey

      JWT_SESSION_KEY=jwtsessiontokenkey
      JWT_REFRESH_KEY=jwtrefreshtokenkey
      
      Without the .env file, the application will use default 
      values, which may cause unexpected behavior and errors.
      
      ========================================================
    `);
  }
}