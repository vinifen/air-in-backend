import { RowDataPacket } from "mysql2";
import DbService from "../services/DbService";

export default class UsersModel {

  constructor(private dbService: DbService){}

  async selectUserById(userID: number) {
    console.log(userID, "USERID EM SELECT USER BY ID");
    try {
      const query = "SELECT * FROM users WHERE id = ?";
      const value = [userID];
      const response = await this.dbService.getQuery(query, value);
      console.log(response, "RESPONSE SELECT USER RID BY PUBLIC")
      if (!response || response.length === 0) {
        throw new Error(`No user found with ID: ${userID}`);
      }
  
      return {
        userID: response[0].id,
        publicUserID: response[0].public_id,
        username: response[0].username,
        password: response[0].password,
      };
    } catch (error) {
      console.error('Error in selectUserById:', error);
      throw error;
    }
  }

  async selectUserByUsername(username: string) {
    const query = "SELECT * FROM users WHERE username = ?";

    const response: RowDataPacket[] = await this.dbService.getQuery(query, [username]);
    if (response.length === 0) {
      return false;
    }

    return {
      userID: response[0].id,
      publicUserID: response[0].public_id,
      username: response[0].username,
      password: response[0].password,
    };
  }

  async selectIDbyPublicID(publicUserID: string) {
    const query = "SELECT id FROM users WHERE public_id = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [publicUserID]);
  
    if (response.length === 0) {
      return null;
    }
  
    return response[0].id;
    
  }

  async insertUser(username: string, password: string, publicUserID: string) {
    try {
      if (!username || !password || !publicUserID) {
        return { status: false, message: 'Username and password are required.' };
      }
  
      const query = "INSERT INTO users(username, password, public_id) VALUES (?,?,?)";
      console.log(username, password, publicUserID);
  
      await this.dbService.getQuery(query, [username, password, publicUserID]);
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