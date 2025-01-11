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

  async getUser(token: string){
    const paylod = this.jwtSessionRefresh.getSessionTokenPayload(token);
    const userId = paylod.userID;
    console.log(userId);
    const result = await this.modelUser.selectUserById(userId);
    console.log(result);
    return {
      userID: result.userID, 
      username: result.username
    };
  }

  async postUser(username: string, password: string) {
    const existingUser = await this.modelUser.selectUserByUsername(username);
  
    if (existingUser) {
      return { status: false, message: `Username ${username} is already registered.` };
    }

    const hashPassword: string = await bcrypt.hash(password, saltRounds);
    const insertResponse = await this.modelUser.insertUser(username, hashPassword);

    if(insertResponse?.status == false){
      console.log(insertResponse);
      return {status: insertResponse.status, message: "Register failed"};
    }

    const response = await this.modelUser.selectUserByUsername(username);
    
    if (response) {
      console.log(username + "asdfasd");

      const publicTokenID = uuidv7();
      const paylod: JwtPayload = { userID: response.userID, username: response.username, publicTokenID: publicTokenID};  
      
      const sessionToken: string = await this.jwtSessionRefresh.generateSessionToken(paylod);
      const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(paylod);

      return {
        sessionToken: sessionToken, 
        refreshToken: refreshToken, 
        username: response.username, 
        userID: response.userID 
      }

    } else {
      return { status: false, message: `User not found` };
    }
  }
}
