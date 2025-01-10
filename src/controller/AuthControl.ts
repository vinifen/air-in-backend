import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import RefreshTokenModel from "../model/RefreshTokenModel";
import bcrypt from "bcrypt";
import { saltRounds } from "../utils/saltRounds";

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

    const paylod: JwtPayload = { userID: response.userID, username: response.username }

    const sessionToken: string = this.jwtSessionRefresh.generateSessionToken(paylod);
    const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(paylod);

    return {
      statusLogin: 200,
      username: response.username,
      userID: response.userID,
      sessionToken,   
      refreshToken,   
      message: "Successfully logged in"
    };
  }

  async regenerateTokens(refreshToken: string) {
    const hashRT = await bcrypt.hash(refreshToken, saltRounds);
    if (!this.jwtSessionRefresh.validityRefreshToken(refreshToken)) {
      this.deleteOldRefreshToken(hashRT);
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    const userId: number = payload.userID;
    const iat: number = payload.iat ?? 0;
  
    if (iat === 0) {
      this.deleteOldRefreshToken(hashRT);
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const hashRefreshToken: {tokenID: number, token: string, iat: number} = await this.refreshTokenModel.selectHashRefreshTokenByUserID(userId, iat);
    if (!hashRefreshToken) {
      this.deleteOldRefreshToken(hashRT);
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, hashRefreshToken.token);
    if (!isRefreshTokenValid) {
      this.deleteOldRefreshToken(hashRT);
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }

    this.deleteOldRefreshToken(hashRefreshToken.token)
  
    const newPayload: JwtPayload = {
      userID: payload.userID,
      username: payload.username,
    };
    const newSessionToken = this.jwtSessionRefresh.generateSessionToken(newPayload);
    const newRefreshToken = this.jwtSessionRefresh.generateRefreshToken(newPayload);
  
    return {
      statusCode: 200,
      newSessionToken,
      newRefreshToken,
      message: "Successfully tokens regenerated",
    };
  }

  deleteOldRefreshToken(hashToken: string){
    this.refreshTokenModel.deleteRefreshTokenByHashToken(hashToken);
  }
  
}