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

    const publicTokenID = uuidv7();
    const payload: JwtPayload = { userID: response.userID, username: response.username, publicTokenID: publicTokenID }

    const sessionToken: string = await this.jwtSessionRefresh.generateSessionToken(payload);
    const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(payload);

    return {
      statusLogin: 200,
      username: response.username,
      userID: response.userID,
      sessionToken,   
      refreshToken,   
      message: "Successfully logged in"
    };
  }

  // async regenerateTokens(refreshToken: string) {
  //   const hashRT = await bcrypt.hash(refreshToken, saltRounds);
  //   if (!this.jwtSessionRefresh.validityRefreshToken(refreshToken)) {
  //     this.deleteOldRefreshToken(hashRT);
  //     return {
  //       statusCode: 400,
  //       message: "Invalid refresh token",
  //     };
  //   }
  
  //   const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
  
  //   const hashRefreshToken = await this.refreshTokenModel.selectHashRefreshTokenByHashToken(refreshToken);
  //   if (!hashRefreshToken || hashRefreshToken.status == false) {
  //     this.deleteOldRefreshToken(hashRT);
  //     return {
  //       statusCode: 400,
  //       message: "Invalid refresh token",
  //     };
  //   }
  
  //   const isRefreshTokenValid = await bcrypt.compare(refreshToken, hashRefreshToken.token);
  //   if (!isRefreshTokenValid) {
  //     this.deleteOldRefreshToken(hashRT);
  //     return {
  //       statusCode: 400,
  //       message: "Invalid refresh token",
  //     };
  //   }

  //   this.deleteOldRefreshToken(hashRefreshToken.token)
  
  //   const newPayload: JwtPayload = {
  //     userID: payload.userID,
  //     username: payload.username,
  //   };
  //   const newSessionToken = await this.jwtSessionRefresh.generateSessionToken(newPayload);
  //   const newRefreshToken = await this.jwtSessionRefresh.generateRefreshToken(newPayload);
  
  //   return {
  //     statusCode: 200,
  //     newSessionToken,
  //     newRefreshToken,
  //     message: "Successfully tokens regenerated",
  //   };
  // }
  async regenerateTokens(refreshToken: string) {
    const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    console.log(payload,  "REFRESH TOKEN PAYLOAD REGENERATE TOKENS");
    const verifyRT = await this.isRefreshTokenValid(refreshToken);
    if(verifyRT.statusCode !== 200){
      return {
        statusCode: verifyRT.statusCode,
        message: verifyRT.message
      }
    }
    console.log(verifyRT, "VERIF TOKEN");
    const verifyHashRT = await this.isHashRefreshTokenValid(payload.userID, payload.publicTokenID);
    console.log(verifyHashRT,  "VERIFY HASH TOKEN");
    if(verifyHashRT.status === false){
      return {
        statusCode: verifyHashRT.statusCode, 
        message: verifyHashRT.message
      }
    }

    const newPublicTokenID = uuidv7();
    const newPayload: JwtPayload = {
      userID: payload.userID,
      username: payload.username,
      publicTokenID: newPublicTokenID
    };
    
    const newSessionToken = await this.jwtSessionRefresh.generateSessionToken(newPayload);
    const newRefreshToken = await this.jwtSessionRefresh.generateRefreshToken(newPayload);
    this.deleteOldHashRefreshToken(payload.userID, payload.publicTokenID);
    return {
      statusCode: 200,
      newSessionToken,
      newRefreshToken,
      message: "Successfully tokens regenerated",
    };

  }

  private async isRefreshTokenValid(rt: string){
   

    if (!this.jwtSessionRefresh.validityRefreshToken(rt)) {
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }

    return {statusCode: 200}
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