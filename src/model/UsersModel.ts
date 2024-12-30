import DbService from "../services/DbService";

export default class UsersModel {

  constructor(private dbService: DbService){}

  async selectAllUsers(){
    const query = "SELECT * FROM users";
    const response = await this.dbService.getQuery(query);
    return response;
  }

  async insertUser(username: string, password: string){
    const query = "INSERT INTO users(username, password) VALUES (?,?)"
    await this.dbService.getQuery(query, [username, password]);
  }
}