import CitiesModel from "../model/CitiesModel";
import WeatherApiService from "../services/WeatherApiService";


export default class CityControl {
  constructor (private apiWeatherService: WeatherApiService, private modelCities: CitiesModel){}

  async postCity(city: string[], id_users: number){
    await this.modelCities.insertCities(city, id_users);
    return await this.apiWeatherService.request(city);
  }

  async getAllCities(){
    const result = await this.modelCities.selectAllCitiesNames();
    return result;
  }

  async getAllWeather(){
    const allCitiesNames: string[] = await this.modelCities.selectAllCitiesNames();
    
    const result = await Promise.all( allCitiesNames.map(async (city: string) =>{
      return await this.apiWeatherService.request( [city] );
    }));
    return result;
  }

  async getWeatherByCity(id: number) {
    const response: string[] = await this.modelCities.selectCityById(id);
   
    const result = await this.apiWeatherService.request(response);
    return result;
  } 
  
}