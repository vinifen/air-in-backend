import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import RefreshTokenModel from "../model/RefreshTokenModel";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";
import { uuidv7 } from "uuidv7";

export default class AuthControl {
  constructor(private modelUser: UsersModel, private refreshTokenModel: RefreshTokenModel, private jwtSessionRefresh: JWTSessionRefreshService) {}

  async loginUser(usnm: string, pswd: string){

    const response = await this.modelUser.selectUserByUsername(usnm);
    if(!response){
      return {statusLogin: 400, message: "Invalid Credentials"}
    }
  
    const isPasswordValid = await bcrypt.compare(pswd, response.password);
    if(!isPasswordValid){
      return {statusLogin: 400, message: "Invalid Credentials"}
    }

    const result = await this.handlerTokens(response.userID, response.username, response.publicUserID);
    if(!result || !result.status){
      return { status: false, statusLogin: result.statusCode}
    }

    return {
      statusLogin: 200,
      username: response.username,
      publicUserID: response.publicUserID,
      sessionToken: result.sessionToken,   
      refreshToken: result.refreshToken,   
      message: "Successfully logged in"
    };
  }

  async regenerateTokens(refreshToken: string) {
    const getPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    if(!getPayload.status){
      return {statusCode: 400, message: getPayload.message}
    }
    const payload: JwtPayload = getPayload.data;
    
    const userId = await this.modelUser.selectIDbyPublicID(payload.publicUserID)

    console.log(payload,  "REFRESH TOKEN PAYLOAD REGENERATE TOKENS");
    console.log(userId, "USER ID EM RegenerateTokens");
    
    if(!this.jwtSessionRefresh.validityRefreshToken(refreshToken)){
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }

    const verifyHashRT = await this.isHashRefreshTokenValid(userId, payload.publicTokenID);
    console.log(verifyHashRT,  "VERIFY HASH TOKEN");
    if(verifyHashRT.status === false){
      return {
        statusCode: verifyHashRT.statusCode, 
        message: verifyHashRT.message
      }
    }

    const result = await this.handlerTokens(userId, payload.username, payload.publicUserID)
    if(!result.status){
      return {statusCode: result.statusCode, message: "Error regenerate tokens"}
    }

    return {
      statusCode: 200,
      newSessionToken: result.sessionToken,
      newRefreshToken: result.refreshToken,
      message: "Successfully tokens regenerated",
    };
  }

  private async handlerTokens(userId: number, username: string, publicUserID: string){
    const newTokens = await this.jwtSessionRefresh.generateNewTokens(userId, username, publicUserID);
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
      refreshToken: newTokens.refreshToken};
  }


  async logout(refreshToken: string): Promise<void>{
    const payload = this.verifyTokenPayload(refreshToken);
   
    if(payload && payload.publicUserID && payload.publicTokenID){
      const userId = await this.modelUser.selectIDbyPublicID(payload.publicUserID);
      await this.deleteOldHashRefreshToken(userId, payload.publicTokenID);
    }
  }


  private verifyTokenPayload(refreshToken: string){
    const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    if(!payload.publicTokenID || !payload.publicUserID){
      return null;
    }
    return payload;
  }


  private async tokenToHashToken(token: string){
    const tokenHash: string = await bcrypt.hash(token, saltRounds);
    return tokenHash;
  }


  private async saveHashRefreshToken(hashRT: string, userID: number, publicTokenID: string){
    const result = await this.refreshTokenModel.insertRefreshToken(hashRT, userID, publicTokenID);

    if(!result.status){
      return {status: result.status, message: result.message}
    }
    return {status: result.status}
  } 


  private async isHashRefreshTokenValid(userID: number, publicTokenID: string){
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


  private async deleteOldHashRefreshToken(userID: number, publicTokenID: string){
    await this.refreshTokenModel.deleteRefreshToken(userID, publicTokenID);
  }
  
}