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
}