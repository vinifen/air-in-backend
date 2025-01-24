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

  async deleteAllUserCities(userID: number, validator: boolean) {
    try {
      if(!validator){
        return {status: false, message: "Delete all user cities data not authorized"}
      }
      const query = "DELETE FROM cities WHERE id_users = ?";
      
      const response = await this.dbService.getQuery(query, [userID]);

      if (response.length === 0) {
        return { status: true, message: "No cities found for this user to delete." };
      }
  
      return { status: true, message: "All cities deleted successfully." };
    } catch (error) {
      console.error("Error in deleteAllUserCities:", error);
      return { status: false, message: "An error occurred while deleting cities." };
    }
  }

  async deleteCity(city: string, userID: number){
    try {
      const query = "DELETE FROM cities WHERE id_users = ? AND name = ?";
      
      const response = await this.dbService.getQuery(query, [userID, city]);

      if (response.length === 0) {
        return { status: true, message: "No cities found for this user to delete." };
      }
  
      return { status: true, message: "All cities deleted successfully." };
    } catch (error) {
      console.error("Error in deleteAllUserCities:", error);
      return { status: false, message: "An error occurred while deleting cities." };
    }
  }

}