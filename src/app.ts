import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { DbService } from './services/DbService';
import LoginRouter from './routes/LoginRouter';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();


if (!fs.existsSync('.env')) {
  console.error(`
    ========================================================
    [ALERT:] .env file is missing!
    
    For improved security and to prevent potential errors, 
    please create a .env file in the root of the project with
    the following variables (example values are provided):

    SERVER_HOSTNAME="localhost"
    SERVER_PORT="1111"
    DB_HOST="localhost"
    DB_USER="root"
    DB_PASSWORD="abc321"
    DB_NAME="air_in_db"
    CORS_ORIGIN="http://localhost:3000"
    
    Without the .env file, the application will use default 
    values, which may cause unexpected behavior and errors.
    
    ========================================================
  `);

    
}

const DB_HOST: string = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "abc321";
const DB_NAME = process.env.DB_NAME || "air_in_db";

const app = fastify();

const database = new DbService(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

const hostname: string = process.env.SERVER_HOSTNAME ? process.env.SERVER_HOSTNAME : "localhost";
const port: number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 1111;

const CORS_ORIGIN = process.env.CORS_ORIGIN ;
const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
};

console.log(corsOptions);
app.register(fastifyCors, corsOptions);

app.register(LoginRouter, database);



app.listen({ port, host: hostname }).then(() => {
  console.log(`HTTP server running on port: ${port}`);
});
