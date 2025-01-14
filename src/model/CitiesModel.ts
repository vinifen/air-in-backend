import { RowDataPacket } from "mysql2";

import DbService from "../services/DbService";

export default class CitiesModel {
  constructor(private dbService: DbService) {}

  async insertCities(cities: string[], userID: number) {
    console.log(cities, userID);
    const query = "INSERT INTO cities(name, id_users) VALUES ?";
    const data = cities.map(city => {
      console.log("DENTRO MAP", city)
      return [city, userID];
    });
    
    await this.dbService.getQuery(query, [data]);
    return data;
  }

  
  async selectAllUserCities(userID: number){
    const query = "SELECT * FROM cities WHERE id_users = ?";

    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID]);
    const data: string[] = response.map((city: RowDataPacket) => {
      return city.name as string;
    });
    return data;
  }

  async selectUserCityByUserIdAndCityName(userID: number, city: string) {
    const query = "SELECT * FROM cities WHERE id_users = ? AND name = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID, city]);
  
    if (response.length > 0) {
      return {data: response[0], status: true};
    } else {
      return {status: false}; 
    }
  }

   // async insertOneCity(city: string){
  //   const query = "INSERT INTO cities(name, id_users) VALUES ?";
  //   await this.dbService.getQuery(query, [city]);
  // }

  //talvez nao use
  // async selectCityById(id: number){
  //   const query = "SELECT * FROM cities WHERE id = ?";

  //   const response: RowDataPacket[] = await this.dbService.getQuery(query, [id]);
  //   const data: string[] = response.map((city: RowDataPacket) => {
  //     return city.name as string;
  //   });
  //   return data;
  // }

   // async selectAllCitiesNames() {
  //   const query = "SELECT * FROM cities";
  
  //   const response: RowDataPacket[] = await this.dbService.getQuery(query);
  //   const data: string[] = response.map((city: RowDataPacket) => {
  //     return city.name as string;
  //   });
  //   return data;
  // }
}