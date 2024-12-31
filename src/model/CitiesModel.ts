import { RowDataPacket } from "mysql2";

import DbService from "../services/DbService";

export default class CitiesModel {
  constructor(private dbService: DbService) {}

  async insertCities(cities: string[], id_users: number) {
    const query = "INSERT INTO cities(name, id_users) VALUES ?";
    const data = cities.map(city => {
      return [city, id_users];
    });
    
    await this.dbService.getQuery(query, [data]);
    return data;
  }
  

  async selectAllCitiesNames() {
    const query = "SELECT * FROM cities";
  
    const response: RowDataPacket[] = await this.dbService.getQuery(query);
    const data: string[] = response.map((city: RowDataPacket) => {
      return city.name as string;
    });
    return data;
  }

  async selectCityById(id: number){
    const query = "SELECT * FROM cities WHERE id = ?";

    const response: RowDataPacket[] = await this.dbService.getQuery(query, [id]);
    const data: string[] = response.map((city: RowDataPacket) => {
      return city.name as string;
    });
    return data;
  }
}