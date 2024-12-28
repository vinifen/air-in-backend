import WeatherApiService from "../services/WeatherApiService";

export default class WeatherApiControl {
  constructor (private apiWeatherService: WeatherApiService){}

  async post(city: string){
    return await this.apiWeatherService.request(city);
  }
}