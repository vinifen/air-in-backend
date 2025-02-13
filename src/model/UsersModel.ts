import { RowDataPacket } from "mysql2";
import DbService from "../services/DbService";

export default class UsersModel {

  constructor(private dbService: DbService){}

  async selectUserById(userID: number) {
    try {
      const query = "SELECT * FROM users WHERE id = ?";
      const value = [userID];
      const response = await this.dbService.getQuery(query, value);
      if (!response || response.length === 0) {
        return null;
      }
  
      return {
        userID: response[0].id,
        publicUserID: response[0].public_id,
        username: response[0].username,
      };
    } catch (error) {
      console.error('Error in selectUserById:', error);
      return null;
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
    };
  }

  async selectUserDatabyPublicID(publicUserID: string) {
    const query = "SELECT * FROM users WHERE public_id = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [publicUserID]);
  
    if (response.length === 0) {
      return null;
    }
  
    return {
      userID: response[0].id,
      username: response[0].username,
      publicUserID: response[0].public_id
    };
  }

  async selectPasswordByUserID(userId: number){
    const query = "SELECT password FROM users WHERE id = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userId]);
    if (response.length === 0) {
      return null;
    }
  
    return response[0].password;
  }

  async insertUser(username: string, password: string, publicUserID: string) {
    try {
      if (!username || !password || !publicUserID) {
        return { status: false, message: 'Username and password are required.' };
      }
  
      const query = "INSERT INTO users(username, password, public_id) VALUES (?,?,?)";
      const hasUsername = await this.selectUserByUsername(username);
      if(hasUsername === false){ 
        await this.dbService.getQuery(query, [username, password, publicUserID]);
      }else {
        return { status: false, message: 'Username has already been added.' };
      }
      
      return { username: username };
    } catch (error) {
      console.error("Error inserting user:", error);
      return { status: false, message: 'An error occurred while inserting the user.' };
    }
  }

  async deleteUserById(userID: number, validator: boolean) {
    try {
      if(!validator){
        return {status: false, message: "Delete user data not authorized"}
      }
  
      const userExists = await this.selectUserById(userID);
      if (!userExists) {
        return { status: false, message: `No user found with ID: ${userID}` };
      }
  
      const query = "DELETE FROM users WHERE id = ?";
      await this.dbService.getQuery(query, [userID]);

      const isUserKeepExists = await this.selectUserById(userID);
      if (isUserKeepExists !== null) {
        return { status: false, message: `Failed to delete user with ID: ${userID}` };
      }
  
      return { status: true, message: `User with ID: ${userID} successfully deleted.` };
    } catch (error) {
      console.error("Error in deleteUserById:", error);
      return { status: false, message: "An error occurred while deleting the user." };
    }
  }

  async alterUsername(userId: number, newUsername: string) {
    try {
      const existingUser = await this.selectUserByUsername(newUsername);
      if (existingUser) {
        return { status: false, message: 'Username is already taken.' };
      }
  
      const userExists = await this.selectUserById(userId);
      if (!userExists) {
        return { status: false, message: `User with ID: ${userId} not found.` };
      }

      const query = "UPDATE users SET username = ? WHERE id = ?";
      await this.dbService.getQuery(query, [newUsername, userId]);
  
      const updatedUser = await this.selectUserById(userId);
      if (updatedUser && updatedUser.username === newUsername) {
        return { status: true, message: 'Username updated successfully.' };
      } else {
        return { status: false, message: 'Failed to update username.' };
      }
    } catch (error) {
      console.error("Error in alterUsername:", error);
      return { status: false, message: 'An error occurred while updating the username.' };
    }
  }

  async alterPassword(userId: number, newHashPassword: string) {
    try {
      const query = "UPDATE users SET password = ? WHERE id = ?";
      await this.dbService.getQuery(query, [newHashPassword, userId]);
      return {status: true, message: "New password changed successfully"}
    } catch (error) {
      console.error("Error in alterUsername:", error);
      return { status: false, message: 'An error occurred while updating the username.' };
    }
  }
}