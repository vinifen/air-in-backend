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
import RefreshTokenModel from './model/RefreshTokenModel';
import AuthControl from './controller/AuthControl';
import AuthService from './services/AuthService';

const app = fastify();

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
const refreshTokenModel = new RefreshTokenModel(databaseService);

const authService = new AuthService(usersModel, sessionRefreshJWTService, refreshTokenModel);

app.register(fastifyCors, configVariables.corsOptions);
app.register(fastifyCookie);
app.register(CityRouter, { db: databaseService, weatherApiS: weatherApiService, jwtSessionRefreshS: sessionRefreshJWTService });
app.register(UserRouter, { db: databaseService, jwtSessionRefreshS: sessionRefreshJWTService, authService });
app.register(AuthRouter, { db: databaseService, jwtSessionRefreshS: sessionRefreshJWTService, authService })

app.listen({ port: configVariables.SERVER_PORT, host: configVariables.SERVER_HOSTNAME }).then(() => {
  console.log(`HTTP server running on port: ${configVariables.SERVER_PORT}`);
});
