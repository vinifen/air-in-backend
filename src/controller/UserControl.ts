import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";
import { uuidv7 } from "uuidv7";
import AuthControl from "./AuthControl";
import AuthService from "../services/AuthService";

export default class UserControl {

  constructor(private modelUser: UsersModel, private jwtSessionRefresh: JWTSessionRefreshService, private authService: AuthService) {}

  // async getAllUsers() {
  //   const result = await this.modelUser.selectAllUsers();
  //   return result;
  // }

  async getUser(sessionToken: string) {
    try {
      const getPayload = this.jwtSessionRefresh.getSessionTokenPayload(sessionToken);
      if(!getPayload.status){
        return {statusCode: 400, message: getPayload.message}
      }
      const payload: JwtPayload = getPayload.data;
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

      
      const result = await this.authService.handlerTokens(response.userID, username, response.publicUserID);
      if (!result.status) {
        return { statusCode: result.statusCode, message: "Error regenerate tokens" };
      }

      return {
        status: true,
        sessionToken: result.sessionToken, 
        refreshToken: result.refreshToken,  
        publicUserID: response.publicUserID,
        username: response.username,
        message: "Successfully tokens regenerated",
      };

    } else {
      return { status: false, message: `User not found` };
    }
  }

  async deleteUser(sessionToken: string, refreshToken: string, password: string){
    if(!this.jwtSessionRefresh.validitySessionToken(sessionToken) || !this.jwtSessionRefresh.validityRefreshToken(refreshToken)){
      return {statusCode: 401, message: "Invalid token"}
    }

    const getPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken)
    if(!getPayload.status || !getPayload.data){
      return {statusCode: 401, message: "Error getting token data"}
    }
    
    const payload: JwtPayload = getPayload.data;
    const userId: number = await this.modelUser.selectIDbyPublicID(payload.publicUserId);
    if(!userId){
      return {statusCode: 401, message: "Error getting id"}
    }

    const isPasswordValid = await this.authService.validatePassword(password, userId);
    if(!isPasswordValid.status){
      return { statusCode: isPasswordValid.status, message: isPasswordValid.message}
    }
  }

}
