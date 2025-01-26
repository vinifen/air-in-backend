import { RowDataPacket } from "mysql2";

import DbService from "../services/DbService";

export default class CitiesModel {
  constructor(private dbService: DbService) {}

  async insertCity(data: [string, number][]) {
    const query = "INSERT INTO cities(name, id_users) VALUES ?";
     
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
  
    if (response.length == 0) {
      return {status: false}; 
    }       
    return {data: response[0], status: true};
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


  async deleteCities(data: [string, number][]) {
    try {
      const deleteResults: { city: string; success: boolean }[] = [];
  
      for (const [city, userID] of data) {
        const query = "DELETE FROM cities WHERE id_users = ? AND name = ?";
        const response = await this.dbService.getQuery(query, [userID, city]);
  
        deleteResults.push({
          city,
          success: response.length > 0,
        });
      }

      const failedDeletes = deleteResults.filter((result) => !result.success).map((result) => result.city);
  
      if (failedDeletes.length == 0) {
        return {
          status: false,
          message: "Failed to delete cities",
        };
      }
  
      return { status: true, message: "All cities deleted successfully." };
    } catch (error) {
      console.error("Error in deleteCities:", error);
      return { status: false, message: "An error occurred while deleting cities." };
    }
  }
}