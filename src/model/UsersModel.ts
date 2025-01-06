import { RowDataPacket } from "mysql2";
import DbService from "../services/DbService";

export default class UsersModel {

  constructor(private dbService: DbService){}

  async selectAllUsers(){
    const query = "SELECT * FROM users";
    const response = await this.dbService.getQuery(query);
    return response;
  }

  async selectUserById(id: number){
    const query = "SELECT * FROM users WHERE id = ?";
    const value = [id];
    const response = await this.dbService.getQuery(query, value);
    return response;
  }

  async selectUserByUsername(username: string) {
    const query = "SELECT * FROM users WHERE username = ?";
    const value = [username];
    const response: RowDataPacket[] = await this.dbService.getQuery(query, value);
    if (response.length === 0) {
      return false;
    }

    return {
      id: response[0].id,
      username: response[0].username,
      password: response[0].password,
    };
  }

  async insertUser(username: string, password: string) {
    try {
      if (!username || !password) {
        return { status: false, message: 'Username and password are required.' };
      }
  
      const query = "INSERT INTO users(username, password) VALUES (?,?)";
      console.log(username, password);
  
      await this.dbService.getQuery(query, [username, password]);
      const result = await this.selectUserByUsername(username);
      
      if(result === false || result.username != username){
        return { status: false, message: 'Error inserting user into database.' };
      }
      
      return { username: username };
    } catch (error) {
      console.error("Error inserting user:", error);
      return { status: false, message: 'An error occurred while inserting the user.' };
    }
  }
}