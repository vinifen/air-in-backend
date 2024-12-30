import { FastifyInstance } from "fastify";
import WeatherApiService from "../services/WeatherApiService";
import CityControl from "../controller/CityControl";
import { sendResponse } from "../services/sendReponse";
import CitiesModel from "../model/CitiesModel";
import DbService from "../services/DbService";

export default function CityRouter(app: FastifyInstance, injections: {db: DbService, weatherApiS: WeatherApiService}) {
  const citiesModel = new CitiesModel(injections.db);
  const cityControl = new CityControl(injections.weatherApiS, citiesModel);

  app.post("/cities", async (request, reply) => {
    const { city, id_users } = request.body as { city: string, id_users: number };
    try {
      const data = await cityControl.postCity(city, id_users);
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.get("/cities/weather", async (_, reply) => {
    try {
      const data = await cityControl.getAllWeather();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities/weather]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.get("/cities/:id/weather", async (request, reply) => {
    const { id } = request.params as { id: number }
    const clientIP = request.ip;
    console.log(clientIP);
    try {
      const data = await cityControl.getWeatherByCity(id);
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /cities/weather]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });
  
  
}