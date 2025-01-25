import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "./JWTSessionRefreshService";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";
import { JwtPayload } from "jsonwebtoken";
import RefreshTokenModel from "../model/RefreshTokenModel";
import { toHash } from "../utils/toHash";

export default class AuthService{
  constructor(
    private jwtSessionRefresh: JWTSessionRefreshService,
    private refreshTokenModel: RefreshTokenModel
  ){}


  async handlerTokens(userId: number, username: string, publicUserID: string){
    const newTokens = await this.jwtSessionRefresh.generateNewTokens(username, publicUserID);
    if(!newTokens || !newTokens.status || !newTokens.refreshToken || !newTokens.sessionToken){
      return { 
        status: false, 
        statusCode: 500, 
        message: newTokens.message
      }
    }
    this.deleteOldHashRefreshToken(userId, newTokens.tokensIDs.publicRefreshTokenID);

    const hashRefreshToken = await toHash(newTokens.refreshToken);
    await this.saveHashRefreshToken(hashRefreshToken, userId, newTokens.tokensIDs.publicRefreshTokenID);
    return {
      status: true, 
      statusCode: 200,
      sessionToken: newTokens.sessionToken, 
      refreshToken: newTokens.refreshToken
    }
  }

  async validatePassword(password: string, hashPassword: string){
    console.log(hashPassword, password, "AUTH PASSWORDddddddddddddd")
    if(!hashPassword || !password){
      return {status: false, statusCode: 400, message: "Invalid Credentials"}
    }
    
    const isPasswordValid = await bcrypt.compare(password, hashPassword);
    if(!isPasswordValid){
      return {status: false, statusCode: 400, message: "Invalid Credentials"}
    }
    return {status: true, statusCode: 200, message: "Password valid"}
  }


  verifyRefreshTokenPayload(refreshToken: string){
    const getPayload: JwtPayload = this.jwtSessionRefresh.getSessionTokenPayload(refreshToken);
    if(!getPayload.status){
      return null;
    }
    const payload = getPayload.data;
    return {publicUserID: payload.publicUserID, username: payload.username, publicTokenID: payload.publicTokenID};
  }

  async saveHashRefreshToken(hashRT: string, userID: number, publicTokenID: string){
    const result = await this.refreshTokenModel.insertRefreshToken(hashRT, userID, publicTokenID);

    if(!result.status){
      return {status: result.status, message: result.message}
    }
    return {status: result.status}
  } 


  async isHashRefreshTokenValid(userID: number, publicTokenID: string){
    console.log(userID, publicTokenID, 'user e public token id');
    const hashRefreshToken = await this.refreshTokenModel.selectHashRefreshToken(userID, publicTokenID);
    console.log(hashRefreshToken);
    if (!hashRefreshToken || hashRefreshToken.status === false || !hashRefreshToken.token ) {
      return {
        status: false,
        statusCode: 400,
        message: hashRefreshToken.message,
      };
    }
    return {status: true, statusCode: 200}
  }


  async deleteOldHashRefreshToken(userID: number, publicTokenID: string){
    console.log(userID, publicTokenID, "DELETE REFRESH TOKEN NO SERVICE");
    const resultDeleteOldRT = await this.refreshTokenModel.deleteRefreshToken(userID, publicTokenID);
    console.log(resultDeleteOldRT, "resultDeleteOldRT")
  }

  async deleteAllUserRefreshTokens(userID: number){
    const result = await this.refreshTokenModel.deleteAllRefreshTokensUser(userID);
    return result;
  }
}