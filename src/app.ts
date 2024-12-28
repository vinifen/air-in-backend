import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import DbService from './services/DbService';
import checkDotEnv from './services/checkDotEnv';

import LoginRouter from './routes/LoginRouter';
import WeatherApiRouter from './routes/WeatherApiRouter';

import dotenv from 'dotenv';
import WeatherApiService from './services/WeatherApiService';

dotenv.config();
checkDotEnv();

const DB_HOST: string = process.env.DB_HOST || "localhost";
const DB_USER: string = process.env.DB_USER || "root";
const DB_PASSWORD: string = process.env.DB_PASSWORD || "abc321";
const DB_NAME: string = process.env.DB_NAME || "air_in_db";

const WEATHER_API_KEY: string = process.env.WEATHER_API_KEY || "yourApiKey";

const SERVER_HOSTNAME: string = process.env.SERVER_HOSTNAME ? process.env.SERVER_HOSTNAME : "localhost";
const SERVER_PORT: number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 1111;

const CORS_ORIGIN = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
};

const app = fastify();

const database = new DbService(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
const weatherApiService = new WeatherApiService(WEATHER_API_KEY);

app.register(fastifyCors, corsOptions);

app.register(WeatherApiRouter, weatherApiService)
app.register(LoginRouter, database);

app.listen({ port: SERVER_PORT, host: SERVER_HOSTNAME }).then(() => {
  console.log(`HTTP server running on port: ${SERVER_PORT}`);
});
