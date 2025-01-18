import CitiesModel from "../model/CitiesModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import WeatherApiService from "../services/WeatherApiService";
import IWeatherAPIResponse from "../interfaces/IWeatherAPIResponse";
import UsersModel from "../model/UsersModel";
import { JwtPayload } from "jsonwebtoken";

export default class CityControl {
  constructor (
    private apiWeatherService: WeatherApiService, 
    private modelCities: CitiesModel, 
    private jwtSessionRefreshS: JWTSessionRefreshService,
    private modelUser: UsersModel
  ){}
  

  async postCitiesWeather(cities: string[], sessionToken: string) {
    const resultUserId = await this.getUserIdBySessionToken(sessionToken);
    if (!resultUserId.status || !resultUserId.data) {
      return { status: false, statusCode: 500, message: resultUserId.message };
    }
    const userID: number = resultUserId.data;
  
    const citiesWeatherResult = await this.fetchWeatherCities(cities);
  
    if (citiesWeatherResult.allValid) {
      const allCitiesNames: string[] = citiesWeatherResult.data.map((city: any) => city.city);
  
      const filteredCities = await this.removeExistingCities(userID, allCitiesNames);
      if (filteredCities.status === false || !filteredCities.data) {
        return { status: false, statusCode: 400, message: filteredCities.message };
      }
  
      await this.modelCities.insertCities(filteredCities.data, userID);
  
      const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
      return { status: true, statusCode: 200, message: "Cities processed successfully", data: citiesWeather };
    }
  
    return { status: false, statusCode: 500, message: "Error fetching weather data" };
  }

  private async removeExistingCities(userID: number, cities: string[]){
    if(!userID || !cities){
      return { status: false, message: "UserID or cities parameters not found"}
    }
    const filteredCities = (
      await Promise.all(
        cities.map(async (city) => {
          const isCityExist = await this.modelCities.selectUserCityByUserIdAndCityName(userID, city);
          if (isCityExist.status) {
            return null;
          }
          return city;
        })
      )
    ).filter(city => city !== null);

    if(filteredCities.length == 0){
      if(cities.length === 1){
        return { status: false, message:  "This city has already been added", data: filteredCities}
      }   
      return { status: false, message: "All cities have now been added", data: filteredCities}
    }

    if(filteredCities.length < cities.length){
      return { status: true, message: "One or more cities have already been added.", data: filteredCities}
    }
    if(cities.length === 1){   
      return {status: true, data: filteredCities, message: "City added successfully."};
    }
    return {status: true, data: filteredCities, message: "All cities added successfully."};
  }


  async getAllUserCitiesWeather(sessionToken: string){
    const resultUserId = await this.getUserIdBySessionToken(sessionToken);
    if(!resultUserId.status || !resultUserId.data){
      return {status: false, statusCode: 500, message: resultUserId.message}
    }
    const allCitiesNames: string[] = await this.modelCities.selectAllUserCities(resultUserId.data);
    const citiesWeatherResult = await this.fetchWeatherCities(allCitiesNames);

    const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
    return {status: true, statusCode: 200, data: citiesWeather};
  }


  async fetchWeatherCities(cities: string[]){
    const citiesWeather = await this.apiWeatherService.request(cities);
    return citiesWeather;
  }


  private async getUserIdBySessionToken(sessionToken: string){
    const getPayload = this.jwtSessionRefreshS.getSessionTokenPayload(sessionToken);
    if(!getPayload.status){
      return {status: false, message: getPayload.message}
    }
    const payload: JwtPayload = getPayload.data;
    const resultUserData = await this.modelUser.selectUserDatabyPublicID(payload.publicUserID)
    if(!resultUserData || !resultUserData.userID){
      return {status: false};
    }
    return {status: true, data: resultUserData.userID};
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