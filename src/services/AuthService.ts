import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "./JWTSessionRefreshService";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";
import { JwtPayload } from "jsonwebtoken";
import RefreshTokenModel from "../model/RefreshTokenModel";

export default class AuthService{
  constructor(
    private modelUser: UsersModel,
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

    const hashRefreshToken = await this.tokenToHashToken(newTokens.refreshToken);
    await this.saveHashRefreshToken(hashRefreshToken, userId, newTokens.tokensIDs.publicRefreshTokenID);
    return {
      status: true, 
      statusCode: 200,
      sessionToken: newTokens.sessionToken, 
      refreshToken: newTokens.refreshToken
    }
  }

  async validatePassword(password: string, userdId: number){
    const hashPassword = await this.modelUser.selectPasswordByUserID(userdId);
    if(!hashPassword){
      return {status: false, statusCode: 400, message: "Invalid Credentials"}
    }
    console.log(hashPassword, password, "AUTH PASSWORD")
    const isPasswordValid = await bcrypt.compare(password, hashPassword);
    if(!isPasswordValid){
      return {status: false, statusCode: 400, message: "Invalid Credentials"}
    }
    return {status: true, statusCode: 200, message: "Password valid"}
  }


  verifyTokenPayload(refreshToken: string){
    const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    if(!payload.publicTokenID || !payload.publicUserID){
      return null;
    }
    return payload;
  }


  async tokenToHashToken(token: string){
    const tokenHash: string = await bcrypt.hash(token, saltRounds);
    return tokenHash;
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
    await this.refreshTokenModel.deleteRefreshToken(userID, publicTokenID);
  }
}