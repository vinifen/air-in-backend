import CitiesModel from "../model/CitiesModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import WeatherApiService from "../services/WeatherApiService";
import IWeatherAPIResponse from "../interfaces/IWeatherAPIResponse";
import UsersModel from "../model/UsersModel";

export default class CityControl {
  constructor (
    private apiWeatherService: WeatherApiService, 
    private modelCities: CitiesModel, 
    private jwtSessionRefreshS: JWTSessionRefreshService,
    private modelUser: UsersModel
  ){}
  

  async postCitiesWeather(cities: string[], sessionToken: string){
    const userID = await this.getUserIdBySessionToken(sessionToken);

    const citiesWeatherResult = await this.fetchWeatherCities(cities);

    

    if(citiesWeatherResult.allValid){ 
      const allCitiesNames: string [] = citiesWeatherResult.data.map((city: any) => city.city);

      const filteredCities = await this.removeExistingCities(userID, allCitiesNames);
      if(filteredCities.status === false || !filteredCities.data){
        return {status: false, message: filteredCities.message}
      }

      await this.modelCities.insertCities( filteredCities.data, userID);
    
    
      const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
      return {data: citiesWeather, message: filteredCities.message};
    }
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
    const userID = await this.getUserIdBySessionToken(sessionToken);
    const allCitiesNames: string[] = await this.modelCities.selectAllUserCities(userID);
    const citiesWeatherResult = await this.fetchWeatherCities(allCitiesNames);

    const citiesWeather: IWeatherAPIResponse[] = citiesWeatherResult.data;
    return citiesWeather;
  }


  async fetchWeatherCities(cities: string[]){
    const citiesWeather = await this.apiWeatherService.request(cities);
    return citiesWeather;
  }


  private async getUserIdBySessionToken(sessionToken: string){
    const payload = this.jwtSessionRefreshS.getSessionTokenPayload(sessionToken);
    const userId: number = await this.modelUser.selectIDbyPublicID(payload.publicUserID);
    return userId;
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