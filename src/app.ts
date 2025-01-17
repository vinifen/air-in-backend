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

const app = fastify();

const database = new DbService(
  configVariables.DB_HOST,
  configVariables.DB_USER,
  configVariables.DB_PASSWORD,
  configVariables.DB_NAME
);
const weatherApiService = new WeatherApiService(configVariables.WEATHER_API_KEY);
const sessionJWT = new JWTService(configVariables.JWT_SESSION_KEY);
const refreshJWT = new JWTService(configVariables.JWT_REFRESH_KEY);
const sessionRefreshJWT = new JWTSessionRefreshService(sessionJWT, refreshJWT);

app.register(fastifyCors, configVariables.corsOptions);
app.register(fastifyCookie);
app.register(CityRouter, { db: database, weatherApiS: weatherApiService, jwtSessionRefreshS: sessionRefreshJWT });
app.register(UserRouter, { db: database, jwtSessionRefreshS: sessionRefreshJWT });
app.register(AuthRouter, { db: database, jwtSessionRefreshS: sessionRefreshJWT })

app.listen({ port: configVariables.SERVER_PORT, host: configVariables.SERVER_HOSTNAME }).then(() => {
  console.log(`HTTP server running on port: ${configVariables.SERVER_PORT}`);
});
