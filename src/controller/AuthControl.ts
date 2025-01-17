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

    const newTokens = await this.generateNewTokens(response.userID, response.username, response.publicUserID);
    if(!newTokens || !newTokens.status){
      return { status: false, statusLogin: 500}
    }

    return {
      statusLogin: 200,
      username: response.username,
      userID: response.userID,
      sessionToken: newTokens.sessionToken,   
      refreshToken: newTokens.refreshToken,   
      message: "Successfully logged in"
    };
  }

  async regenerateTokens(refreshToken: string) {
    const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
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

    const newTokens = await this.generateNewTokens(userId, payload.username, payload.publicUserID);
    if(!newTokens || !newTokens.status){
      return { statusCode: 500}
    }
    
    this.deleteOldHashRefreshToken(userId, payload.publicTokenID);
    return {
      statusCode: 200,
      newSessionToken: newTokens.sessionToken,
      newRefreshToken: newTokens.refreshToken,
      message: "Successfully tokens regenerated",
    };

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

  private async generateNewTokens(userID: number, username: string, publicUserID: string){
    if(!username || !userID || !publicUserID){
      return {status: false, message: "Error generating tokens: Invalid parameters"}
    }
    const newPublicTokenID = uuidv7();
    const payload: JwtPayload = { publicUserID: publicUserID, username: username, publicTokenID: newPublicTokenID }

    const sessionToken: string = await this.jwtSessionRefresh.generateSessionToken(payload);
    const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(payload);
  
    const tokenHash: string = await bcrypt.hash(refreshToken, saltRounds);
    const saveHashRT = await this.saveHashRefreshToken(tokenHash, userID, newPublicTokenID);
    if(!saveHashRT.status){
      return {status: false, message: saveHashRT.message}
    }
    return {status: true, sessionToken: sessionToken, refreshToken: refreshToken}
  }


  private async saveHashRefreshToken(hashRT: string, userID: number, publicTokenID: string){
    const result = await this.refreshTokenModel.insertRefreshToken(hashRT, userID, publicTokenID);

    if(!result.status){
      return {status: result.status, message: result.message}
    }
    return {status: result.status}
  } 


  private async isHashRefreshTokenValid(userID: string, publicTokenID: string){
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


  private async deleteOldHashRefreshToken(userID: string, publicTokenID: string){
    await this.refreshTokenModel.deleteRefreshToken(userID, publicTokenID);
  }
  
}