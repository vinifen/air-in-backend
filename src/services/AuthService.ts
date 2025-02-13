import JWTSessionRefreshService from "./JWTSessionRefreshService";
import bcrypt from "bcrypt";
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
    const passwordRegex = /^(?!\s)(?!.*\s$)(?=(.*[A-Za-z\d]){6,})[A-Za-z\d@_.!?\-/]{4,90}$/;
    if(!passwordRegex.test(password)){
      return {status: false, statusCode: 400, message: "Password: 4-90 chars, min 6 letters, only A-Z, 0-9, @ _ - . ! ? /. No spaces at start/end."}
    }

    if(!hashPassword || !password){
      return {status: false, statusCode: 400, message: "Invalid Credentials"}
    }
    
    const isPasswordValid = await bcrypt.compare(password, hashPassword);
    if(!isPasswordValid){
      return {status: false, statusCode: 400, message: "Invalid Credentials"}
    }
    return {status: true, statusCode: 200, message: "Password valid"}
  }


  async validateUsername(username: string){
    const usernameRegex = /^[A-Za-z0-9\s]{2,30}$/;
    if(!usernameRegex.test(username)){
      return {status: false, statusCode: 400, message: "Username: 2-30 chars, only A-Z, 0-9."}
    }
    return {status: true, statusCode: 200, message: "Username valid"}
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
    const hashRefreshToken = await this.refreshTokenModel.selectHashRefreshToken(userID, publicTokenID);
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
    const resultDeleteOldRT = await this.refreshTokenModel.deleteRefreshToken(userID, publicTokenID);
    return resultDeleteOldRT;
  }

  async deleteAllUserRefreshTokens(userID: number){
    const result = await this.refreshTokenModel.deleteAllRefreshTokensUser(userID);
    return result;
  }
}