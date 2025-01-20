import CitiesModel from "../model/CitiesModel";

export default class CityService {
  constructor(private modelCities: CitiesModel){}

  async deleteAllUserCities(userID: number, validator: boolean){
    if(!validator){
      return {status: false, message: "Delete all user cities not authorized"}
    }
    const resultDeleteCities = await this.modelCities.deleteAllUserCities(userID, validator);
    return resultDeleteCities;
  }


  async removeExistingCities(userID: number, cities: string[]){
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
}