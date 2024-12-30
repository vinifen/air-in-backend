import DbService from "../services/DbService";

export default class CitiesModel {
  constructor(private dbService: DbService) {}

  async insertCity(name: string, id_users: number){
    const query = "INSERT INTO cities(name, id_users) VALUES (?,?)";
    await this.dbService.getQuery(query, [name, id_users]);
  }

  async selectAllCitiesNames(){
    const query = "SELECT * FROM cities";

    const response = await this.dbService.getQuery(query);
    console.log(response + "teste all cities");
    return response;
  }

  async selectCityById(id: number){
    const query = "SELECT * FROM cities WHERE id = ?";

    const response = await this.dbService.getQuery(query, [id]);
    return response;
  }
}