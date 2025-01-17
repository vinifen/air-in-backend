import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";
import { uuidv7 } from "uuidv7";

export default class UserControl {

  constructor(private modelUser: UsersModel, private jwtSessionRefresh: JWTSessionRefreshService) {}

  // async getAllUsers() {
  //   const result = await this.modelUser.selectAllUsers();
  //   return result;
  // }

  async getUser(token: string) {
    try {
      const payload = this.jwtSessionRefresh.getSessionTokenPayload(token);
      console.log(payload, "PAYLOAD GETUSER")
      if (!payload || !payload.publicUserID) {
        throw new Error('Invalid token payload or publicUserID not found.');
      }
  
      const publicUserID = payload.publicUserID;
      const userId = await this.modelUser.selectIDbyPublicID(publicUserID);
  
      if (!userId) {
        throw new Error(`User ID not found for publicUserID: ${publicUserID}`);
      }
  
      const result = await this.modelUser.selectUserById(userId);
  
      if (!result) {
        throw new Error(`User not found for ID: ${userId}`);
      }
  
      return {
        publicUserID: result.publicUserID,
        username: result.username,
      };
    } catch (error) {
      console.error('Error in getUser:', error);
      throw new Error('Failed to retrieve user information.');
    }
  }

  async postUser(username: string, password: string) {
    const existingUser = await this.modelUser.selectUserByUsername(username);
  
    if (existingUser) {
      return { status: false, message: `Username ${username} is already registered.` };
    }

    const hashPassword: string = await bcrypt.hash(password, saltRounds);

    const newPublicUserID = uuidv7();
    const insertResponse = await this.modelUser.insertUser(username, hashPassword, newPublicUserID);

    if(insertResponse?.status == false){
      console.log(insertResponse);
      return {status: insertResponse.status, message: "Register failed"};
    }

    const response = await this.modelUser.selectUserByUsername(username);
    
    if (response) {
      console.log(username + "asdfasd");

      const newPublicTokenID = uuidv7();
      const paylod: JwtPayload = { publicUserID: newPublicUserID, username: response.username, publicTokenID: newPublicTokenID};  
      
      const sessionToken: string = await this.jwtSessionRefresh.generateSessionToken(paylod);
      const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(paylod);

      return {
        sessionToken: sessionToken, 
        refreshToken: refreshToken, 
        username: response.username, 
        publicUserID: response.publicUserID 
      }

    } else {
      return { status: false, message: `User not found` };
    }
  }

}
