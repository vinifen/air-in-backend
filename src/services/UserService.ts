import { uuidv7 } from "uuidv7";
import UsersModel from "../model/UsersModel";
import { toHash } from "../utils/toHash";
import AuthService from "./AuthService";

export default class UserService{
  constructor(
    private modelUser: UsersModel,
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
      return {status: false};
    }

    return {
      status: true, 
      username: resultUserData.username, 
      publicUserID: resultUserData.publicUserID, 
      userID: resultUserData.userID
    };
  }


  async verifyUsernameValidity(username: string){
    const existingUser = await this.modelUser.selectUserByUsername(username);
  
    if (existingUser) {
      return false;
    }
    return true
  }


  async addNewUser(username: string, password: string){
    const hashPassword = await toHash(password);

    const newPublicUserID = uuidv7();
    const insertResponse = await this.modelUser.insertUser(username, hashPassword, newPublicUserID);
    if(insertResponse.status == false){
      console.log(insertResponse);
      return {status: insertResponse.status, message: "Register failed"};
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

  
}