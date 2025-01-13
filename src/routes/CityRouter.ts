import { FastifyInstance } from "fastify";
import WeatherApiService from "../services/WeatherApiService";
import CityControl from "../controller/CityControl";
import { sendResponse } from "../utils/sendReponse";
import CitiesModel from "../model/CitiesModel";
import DbService from "../services/DbService";
import { verifyAuth } from "../middleware/verifyAuth";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";


export default function CityRouter(app: FastifyInstance, injections: {db: DbService, weatherApiS: WeatherApiService, jwtSessionRefreshS: JWTSessionRefreshService}) {
  const citiesModel = new CitiesModel(injections.db);
  const cityControl = new CityControl(injections.weatherApiS, citiesModel);

  app.post("/cities", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {cities} = request.body as {cities: string[]}
    const {userID} = request.body as {userID: number}

    try {
      await cityControl.postCity(cities, userID);
      const data = await cityControl.getAllWeather();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.get("/cities", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (_, reply) => {
    try {
      const data = await cityControl.getAllCities();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities/cities]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.get("/cities/weather", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (_, reply) => {
    try {
      const data = await cityControl.getAllWeather();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities/weather]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  //talvez nao use
  app.get("/cities/:id/weather", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const { id } = request.params as { id: number };
 
    try {
      const data = await cityControl.getWeatherByCityID(id);
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities/weather]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });
  
  
  app.post("/cities/weather/unlogged", async (request, reply) => {
    const cities: string[] = request.body as string[];

    try {
      const data  = await injections.weatherApiS.request(cities);
      
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities/weather/unlogged]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });
}