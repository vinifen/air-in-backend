import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import DbService from './services/DbService';
import WeatherApiService from './services/WeatherApiService';
import CityRouter from './routes/CityRouter';
import UserRouter from './routes/UserRouter';
import JWTService from './services/JWTService';
import fastifyCookie from '@fastify/cookie';
import JWTSessionRefreshService from './services/JWTSessionRefreshService';
import AuthRouter from './routes/AuthRouter';
import { configVariables } from './utils/configVariables';
import UsersModel from './model/UsersModel';
import UserService from './services/UserService';
import checkDotEnv from './utils/checkDotEnv';

checkDotEnv();
const app = fastify();

console.log(configVariables.COOKIE_SECURE, configVariables.CORS_ORIGIN, configVariables.DB_HOST, configVariables.DB_NAME, configVariables.DB_PASSWORD, configVariables.DB_USER, configVariables.JWT_REFRESH_KEY, configVariables.JWT_SESSION_KEY, configVariables.SERVER_HOSTNAME, configVariables.SERVER_PORT, configVariables.WEATHER_API_KEY, configVariables.corsOptions);

const databaseService = new DbService(
  configVariables.DB_HOST,
  configVariables.DB_USER,
  configVariables.DB_PASSWORD,
  configVariables.DB_NAME
);

const sessionJWT = new JWTService(configVariables.JWT_SESSION_KEY);
const refreshJWT = new JWTService(configVariables.JWT_REFRESH_KEY);
const sessionRefreshJWTService = new JWTSessionRefreshService(sessionJWT, refreshJWT);

const weatherApiService = new WeatherApiService(configVariables.WEATHER_API_KEY);

const usersModel = new UsersModel(databaseService);
const userService = new UserService(usersModel, sessionRefreshJWTService);

app.register(fastifyCors, configVariables.corsOptions);
app.register(fastifyCookie);
app.register(CityRouter, { db: databaseService, weatherApiS: weatherApiService, jwtSessionRefreshS: sessionRefreshJWTService, userService });
app.register(UserRouter, { db: databaseService, jwtSessionRefreshS: sessionRefreshJWTService, userService });
app.register(AuthRouter, { db: databaseService, jwtSessionRefreshS: sessionRefreshJWTService, userService })

app.listen({ 
  port: configVariables.SERVER_PORT, 
  host: '0.0.0.0'
}).then(() => {
  console.log(`HTTP server running on port: ${configVariables.SERVER_PORT}`);
});