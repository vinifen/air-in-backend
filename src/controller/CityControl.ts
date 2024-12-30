import { RowDataPacket } from "mysql2";
import CitiesModel from "../model/CitiesModel";
import WeatherApiService from "../services/WeatherApiService";

export default class CityControl {
  constructor (private apiWeatherService: WeatherApiService, private modelCities: CitiesModel){}

  async postCity(city: string, id_users: number){
    await this.modelCities.insertCity(city, id_users);
    return await this.apiWeatherService.request(city);
  }

  async getAllCities(){
    const result = await this.modelCities.selectAllCitiesNames();
    return result;
  }

  async getAllWeather(){
    const allCitiesNames: RowDataPacket[] = await this.modelCities.selectAllCitiesNames();

    const result = await Promise.all( allCitiesNames.map(async (row: RowDataPacket) =>{
      const cityName = row.name as string;
      return this.apiWeatherService.request(cityName);
    }));
    return result;
  }

  async getWeatherByCity(id: number) {
    const response = await this.modelCities.selectCityById(id);
    const cityName = response[0].name as string;
  
    const result = await this.apiWeatherService.request(cityName);
    return result;
  }
  
}