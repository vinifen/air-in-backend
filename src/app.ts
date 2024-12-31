import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import DbService from './services/DbService';
import WeatherApiService from './services/WeatherApiService';
import CityRouter from './routes/CityRouter';
import UserRouter from './routes/UserRouter';
import ConfigService from './services/ConfigService'; 

const app = fastify();

const config = new ConfigService();
const database = new DbService(
  config.DB_HOST,
  config.DB_USER,
  config.DB_PASSWORD,
  config.DB_NAME
);
const weatherApiService = new WeatherApiService(config.WEATHER_API_KEY);


app.register(fastifyCors, config.corsOptions);
app.register(CityRouter, { db: database, weatherApiS: weatherApiService });
app.register(UserRouter, { db: database });

app.listen({ port: config.SERVER_PORT, host: config.SERVER_HOSTNAME }).then(() => {
  console.log(`HTTP server running on port: ${config.SERVER_PORT}`);
});
