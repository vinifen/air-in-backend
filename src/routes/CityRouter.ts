import { FastifyInstance } from "fastify";
import WeatherApiService from "../services/WeatherApiService";
import CityControl from "../controller/CityControl";
import { sendResponse } from "../utils/sendReponse";
import CitiesModel from "../model/CitiesModel";
import DbService from "../services/DbService";
import { verifyAuth } from "../middleware/verifyAuth";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import IWeatherAPIResponse from "../interfaces/IWeatherAPIResponse";
import UsersModel from "../model/UsersModel";
import UserService from "../services/UserService";
import CityService from "../services/CityService";


export default function CityRouter(app: FastifyInstance, injections: {db: DbService, weatherApiS: WeatherApiService, jwtSessionRefreshS: JWTSessionRefreshService}) {
  const citiesModel = new CitiesModel(injections.db);
  const usersModel = new UsersModel(injections.db);
  const userService = new UserService(usersModel, injections.jwtSessionRefreshS);
  const cityService = new CityService(citiesModel);
  const cityControl = new CityControl(injections.weatherApiS, citiesModel, usersModel, userService, cityService);

  app.post("/cities-weather", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {cities} = request.body as {cities: string[]}
    const {sessionToken} = request.cookies as {sessionToken: string};
    
    try {
      const data = await cityControl.postCitiesWeather(cities, sessionToken);
      if(!data.status){
        return sendResponse(reply, data.statusCode, data.message);
      }
      return sendResponse(reply, 200, data.data);
    } catch (error: any) {
      console.error("[Error in post /cities-weather:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.get("/cities-weather", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string};
    try {
      const data = await cityControl.getAllUserCitiesWeather(sessionToken);
      if(!data.status){
        return sendResponse(reply, data.statusCode, data.message);
      }
      return sendResponse(reply, data.statusCode, data.data);
    } catch (error: any) {
      console.error("[Error in get /cities-weather:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.post("/cities-weather/public", async (request, reply) => {
    const cities: string[] = request.body as string[];

    try {
      const data  = await cityControl.fetchWeatherCities(cities);
      
      return sendResponse(reply, 200, data.data);
    } catch (error: any) {
      console.error("[Error in post /cities-weather/public]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.delete("/cities-weather", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string};
    const {cities} = request.body as {cities: string []}
    try {
      if(cities.length == 0){
        return sendResponse(reply, 400, "No city to be excluded");
      }
      const resultCityControl = await cityControl.deleteCities(cities, sessionToken);
      if(!resultCityControl.status){
        return  sendResponse(reply, resultCityControl.statusCode, resultCityControl.message);
      }
      return sendResponse(reply, 200, resultCityControl.message);
    } catch (error: any) {
      console.error("[Error in delete /cities-weather]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });

  //talvez nao use
  // app.get("/cities-weather/:id/", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
  //   const { id } = request.params as { id: number };
 
  //   try {
  //     const data = await cityControl.getWeatherByCityID(id);
  //     return sendResponse(reply, 200, data);
  //   } catch (error: any) {
  //     console.error("[Error in post /cities-weather/:id/", error);
  //     return sendResponse(reply, 500, { message: error.message || error });
  //   }
  // });
  
  
  
}