import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import RefreshTokenModel from "../model/RefreshTokenModel";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";
import AuthService from "../services/AuthService";


export default class AuthControl {
  constructor(
    private modelUser: UsersModel, 
    private refreshTokenModel: RefreshTokenModel, 
    private jwtSessionRefresh: JWTSessionRefreshService,
    private authService: AuthService
  ) {}

  async loginUser(usnm: string, pswd: string){
    //
    const response = await this.modelUser.selectUserByUsername(usnm);
    if(!response){
      return {statusCode: 400, message: "Invalid Credentials"}
    }
  
    const isPasswordValid = await this.authService.validatePassword(pswd, response.userID);
    if(!isPasswordValid.status){
      return { statusCode: isPasswordValid.status, message: isPasswordValid.message}
    }

    const result = await this.authService.handlerTokens(response.userID, response.username, response.publicUserID);
    if(!result || !result.status){
      return { status: false, statusCode: result.statusCode}
    }

    return {
      statusCode: 200,
      username: response.username,
      publicUserID: response.publicUserID,
      sessionToken: result.sessionToken,   
      refreshToken: result.refreshToken,   
      message: "Successfully logged in"
    };
  }

  async regenerateTokens(refreshToken: string) {
    //
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

    const verifyHashRT = await this.authService.isHashRefreshTokenValid(userId, payload.publicTokenID);
    console.log(verifyHashRT,  "VERIFY HASH TOKEN");
    if(verifyHashRT.status === false){
      return {
        statusCode: verifyHashRT.statusCode, 
        message: verifyHashRT.message
      }
    }

    const result = await this.authService.handlerTokens(userId, payload.username, payload.publicUserID)
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

  async logout(refreshToken: string): Promise<void>{
    //
    const payload = this.authService.verifyTokenPayload(refreshToken);
   
    if(payload && payload.publicUserID && payload.publicTokenID){
      const userId = await this.modelUser.selectIDbyPublicID(payload.publicUserID);
      await this.authService.deleteOldHashRefreshToken(userId, payload.publicTokenID);
    }
  }

}