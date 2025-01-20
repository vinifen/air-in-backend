import CitiesModel from "../model/CitiesModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import WeatherApiService from "../services/WeatherApiService";
import IWeatherAPIResponse from "../interfaces/IWeatherAPIResponse";
import UsersModel from "../model/UsersModel";
import { JwtPayload } from "jsonwebtoken";
import UserService from "../services/UserService";
import CityService from "../services/CityService";

export default class CityControl {
  constructor (
    private apiWeatherService: WeatherApiService, 
    private modelCities: CitiesModel, 
    private jwtSessionRefreshS: JWTSessionRefreshService,
    private modelUser: UsersModel,
    private userService: UserService,
    private cityService: CityService,
  ){}
  

  async postCitiesWeather(cities: string[], sessionToken: string) {
    //
    const getPayload = this.jwtSessionRefreshS.getSessionTokenPayload(sessionToken);
    if(!getPayload.status){
      return {status: false, statusCode: 400, message: getPayload.message}
    }
    const payload: JwtPayload = getPayload.data;

    const resultUserData = await this.userService.verifyPublicUserIdData(payload.publicUserID);
    if(!resultUserData.status || !resultUserData.userID){
      return {status: false, statusCode: 500, message: "Error getting all cities"}
    }
  
    const citiesWeatherResult = await this.fetchWeatherCities(cities);
  
    if (citiesWeatherResult.allValid) {
      const allCitiesNames: string[] = citiesWeatherResult.data.map((city: any) => city.city);
  
      const filteredCities = await this.cityService.removeExistingCities(resultUserData.userID, allCitiesNames);
      if (filteredCities.status === false || !filteredCities.data) {
        return { status: false, statusCode: 400, message: filteredCities.message };
      }
  
      await this.modelCities.insertCities(filteredCities.data, resultUserData.userID);
  
      const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
      return { status: true, statusCode: 200, message: "Cities processed successfully", data: citiesWeather };
    }
  
    return { status: false, statusCode: 400, message: "Error fetching weather data" };
  }


  async getAllUserCitiesWeather(sessionToken: string){
    //
    const getPayload = this.jwtSessionRefreshS.getSessionTokenPayload(sessionToken);
    if(!getPayload.status){
      return {status: false, statusCode: 400, message: getPayload.message}
    }
    const payload: JwtPayload = getPayload.data;

    const resultUserData = await this.userService.verifyPublicUserIdData(payload.publicUserID);
    if(!resultUserData.status || !resultUserData.userID){
      return {status: false, statusCode: 500, message: "Error getting all cities"}
    }

    const allCitiesNames: string[] = await this.modelCities.selectAllUserCities(resultUserData.userID);
    const citiesWeatherResult = await this.fetchWeatherCities(allCitiesNames);

    const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
    return {status: true, statusCode: 200, data: citiesWeather};
  }
  

  async fetchWeatherCities(cities: string[]){
    const citiesWeather = await this.apiWeatherService.request(cities);
    return citiesWeather;
  }




  


  // async getAllWeather(){
  //   const allCities: string[] = await this.modelCities.selectAllCities();
    
  //   const result = await Promise.all( allCities.map(async (cities: string) =>{
  //     return await this.apiWeatherService.request( [cities] );
  //   }));
  //   return result;
  // }

  // //talvez eu nao use
  // async getWeatherBycitiesID(id: number) {
  //   const response: string[] = await this.modelCities.selectcitiesById(id);
   
  //   const result = await this.apiWeatherService.request(response);
  //   return result;
  // } 
  
}