import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";

export default class UserControl {

  constructor(private modelUser: UsersModel, private jwtSessionRefresh: JWTSessionRefreshService) {}

  async getAllUsers() {
    const result = await this.modelUser.selectAllUsers();
    return result;
  }

  async getUser(token: string){
    const paylod = this.jwtSessionRefresh.getSessionTokenPayload(token);
    const userId = paylod.id;
    const result = await this.modelUser.selectUserById(userId);
    return result;
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
      return {status: insertResponse.status, message: insertResponse.message};
    }

    const response = await this.modelUser.selectUserByUsername(username);
    
    if (response) {
      const { id, username } = response; 
      console.log(username + "asdfasd");
      const paylod: JwtPayload = { id, username };  
      
      const sessionToken: string = this.jwtSessionRefresh.generateSessionToken(paylod);
      const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(paylod);

      return {sessionToken: sessionToken, refreshToken: refreshToken};
    } else {
      throw new Error('User not found');
    }
  }
}
