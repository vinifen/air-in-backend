import { uuidv7 } from "uuidv7";
import UsersModel from "../model/UsersModel";
import { toHash } from "../utils/toHash";
import JWTSessionRefreshService from "./JWTSessionRefreshService";
import { JwtPayload } from "jsonwebtoken";

export default class UserService{
  constructor(
    private modelUser: UsersModel,
    private jwtSessionRefreshS: JWTSessionRefreshService,
  ){}

  async deleteUserData(userID: number, validator: boolean){
    if(!validator){
      return {status: false, message: "Delete user not authorized"}
    }
    const resultDeleteData = await this.modelUser.deleteUserById(userID, validator);
    return resultDeleteData;
  }


  async verifyPublicUserIdData(publicUserID: string){
    const resultUserData = await this.modelUser.selectUserDatabyPublicID(publicUserID)
    if(!resultUserData || !resultUserData.userID){
      return {status: false, message: "User not found"};
    }

    return {
      status: true, 
      username: resultUserData.username, 
      publicUserID: resultUserData.publicUserID, 
      userID: resultUserData.userID
    };
  }


  async checkIfUsernameExists(username: string){
    const existingUser = await this.modelUser.selectUserByUsername(username);
    if(!existingUser){
      return false;
    }
  
    if(existingUser.username === username){
      return true;
    }
    return false;
  }


  async addNewUser(username: string, password: string){
    const hashPassword = await toHash(password);

    const newPublicUserID = uuidv7();
    const insertResponse = await this.modelUser.insertUser(username, hashPassword, newPublicUserID);
    if(insertResponse.status == false){
      return {status: insertResponse.status, message: insertResponse.message};
    }
    return {status: true}
  }


  async getUserDataByUsername(username: string){
    const userData = await this.modelUser.selectUserByUsername(username);
    if(!userData){
      return null;
    }
    return {
      userID: userData.userID,
      publicUserID: userData.publicUserID,
      username: userData.username
    }
  }

  async updateUsername(newUsername: string, userID: number){
    const resultUpdateUsername = this.modelUser.alterUsername(userID, newUsername);
    return resultUpdateUsername;
  }

  async updatePassword(newPassword: string, userID: number){
    const newHashPassword: string = await toHash(newPassword);
    const resultUpdateUsername = this.modelUser.alterPassword(userID, newHashPassword);
    return resultUpdateUsername;
  }

  async getUserDataBySessionToken(sessionToken: string){
    const getPayload = this.jwtSessionRefreshS.getSessionTokenPayload(sessionToken);
    if(!getPayload.status){
      return {status: false, statusCode: 400, message: getPayload.message}
    }
    const payload: JwtPayload = getPayload.data;

    const resultUserData = await this.verifyPublicUserIdData(payload.publicUserID);
    if(!resultUserData.status || !resultUserData.userID){
      return {status: false, statusCode: 500, message: "User data not found"}
    }
    return {status: true, statusCode: 200, data: resultUserData}
  }

  async getHashPassword(userID: number){
    const resultPassword = await this.modelUser.selectPasswordByUserID(userID);
    if(!resultPassword){
      return {status: false, message: "Password not found"}
    }
    return {status: true, password: resultPassword}
  }
  
}