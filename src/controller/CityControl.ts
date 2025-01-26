import WeatherApiService from "../services/WeatherApiService";
import IWeatherAPIResponse from "../interfaces/IWeatherAPIResponse";
import UserService from "../services/UserService";
import CityService from "../services/CityService";

export default class CityControl {
  constructor (
    private apiWeatherService: WeatherApiService, 
    private userService: UserService,
    private cityService: CityService,
  ){}
  

  async postCitiesWeather(cities: string[], sessionToken: string) {
    const getUserData = await this.userService.getUserDataBySessionToken(sessionToken);
    if(!getUserData.status || !getUserData.data){
      return {status: false, statusCode: getUserData.statusCode, message: getUserData.message}
    }
    const resultUserData = getUserData.data;
  
    const citiesWeatherResult = await this.fetchWeatherCities(cities);
  
    if (citiesWeatherResult.allValid) {
      const allCitiesNames: string[] = citiesWeatherResult.data.map((city: any) => city.city);
  
      const filteredCities = await this.cityService.removeExistingCities(resultUserData.userID, allCitiesNames);
      if (filteredCities.status === false || !filteredCities.data) {
        return { status: false, statusCode: 400, message: filteredCities.message };
      }
  
      await this.cityService.addNewCities(filteredCities.data, resultUserData.userID);
  
      const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
      return { status: true, statusCode: 200, message: "Cities processed successfully", data: citiesWeather };
    }
  
    return { status: false, statusCode: 400, message: "Error fetching weather data" };
  }


  async getAllUserCitiesWeather(sessionToken: string){
    const getUserData = await this.userService.getUserDataBySessionToken(sessionToken);
    if(!getUserData.status || !getUserData.data){
      return {status: false, statusCode: getUserData.statusCode, message: getUserData.message}
    }
    const resultUserData = getUserData.data;

    const allCitiesNames: string[] = await this.cityService.getAllCitiesByUserID(resultUserData.userID);
    const citiesWeatherResult = await this.fetchWeatherCities(allCitiesNames);

    const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
    return {status: true, statusCode: 200, data: citiesWeather};
  }
  

  async fetchWeatherCities(cities: string[]){
    const citiesWeather = await this.apiWeatherService.request(cities);
    return citiesWeather;
  }

  async deleteCities(cities: string[], sessionToken: string){
    const getUserData = await this.userService.getUserDataBySessionToken(sessionToken);
    if(!getUserData.status || !getUserData.data){
      return {status: false, statusCode: getUserData.statusCode, message: getUserData.message}
    }
    const resultUserData = getUserData.data;

    const resultRemoveCities = await this.cityService.deleteCities(cities, resultUserData.userID);
    if(!resultRemoveCities.status){
      return {status: false, statusCode: 400, message: resultRemoveCities.message}
    }

    return {status: true, statusCode: 200, message:resultRemoveCities.message}
  }

}