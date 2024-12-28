import { FastifyInstance } from "fastify";
import WeatherApiService from "../services/WeatherApiService";
import WeatherApiControl from "../controller/WeatherApiControl";
import { sendResponse } from "../services/sendReponse";

export default function WeatherApiRouter(app: FastifyInstance, WeatherApiS: WeatherApiService) {
  const weatherControl = new WeatherApiControl(WeatherApiS);
  
  app.post("/weatherApi", async (request, reply) => {
    const { city } = request.body as { city: string };
    try {
      const data = await weatherControl.post(city);
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in post /weatherApi:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });
}