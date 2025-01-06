import { JwtPayload } from "jsonwebtoken";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import RefreshTokenModel from "../model/RefreshTokenModel";
import bcrypt from "bcrypt";

export default class AuthControl {
  constructor(private modelUser: UsersModel, private refreshTokenModel: RefreshTokenModel, private jwtSessionRefresh: JWTSessionRefreshService) {}

  async loginUser(usnm: string, pswd: string){
    const response = await this.modelUser.selectUserByUsername(usnm);
    if(!response){
      return {statusLogin: false, message: "Invalid Credentials"};
    }
  
    const isPasswordValid = await bcrypt.compare(pswd, response.password);
    if(!isPasswordValid){
      return {statusLogin: false, message: "Invalid Credentials"}
    }
    const { id, username } = response; 
    const paylod: JwtPayload = { id, username };

    const sessionToken: string = this.jwtSessionRefresh.generateSessionToken(paylod);
    const refreshToken: string = await this.jwtSessionRefresh.generateRefreshToken(paylod);

    return {
      statusLogin: true,
      sessionToken,   
      refreshToken,   
      message: "Successfully logged in"
    };
  }

  async regenerateTokens(refreshToken: string) {
    if (!this.jwtSessionRefresh.validityRefreshToken(refreshToken)) {
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const payload: JwtPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    const userId: number = payload.id;
    const iat: number = payload.iat ?? 0;
  
    if (iat === 0) {
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const hashRefreshToken = await this.refreshTokenModel.selectHashRefreshTokenByUserID(userId, iat);
    if (!hashRefreshToken) {
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, hashRefreshToken.token);
    if (!isRefreshTokenValid) {
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }
  
    const newPayload: JwtPayload = {
      id: payload.id,
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
  
}