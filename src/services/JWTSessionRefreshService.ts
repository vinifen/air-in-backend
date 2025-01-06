import { JwtPayload } from "jsonwebtoken";
import JWTService from "./JWTService";
import RefreshTokenModel from "../model/RefreshTokenModel";
import bcrypt from "bcrypt";
import DbService from "./DbService";
import { saltRounds } from "../utils/saltRounds";

export default class JWTSessionRefreshService{
  private refreshTokenModel: RefreshTokenModel;
  constructor(private jwtSession: JWTService, private jwtRefresh: JWTService, dbService: DbService){
    this.refreshTokenModel = new RefreshTokenModel(dbService);
  }

  getSessionTokenPayload(token: string): JwtPayload{
    return this.jwtSession.getTokenPayload(token);
  }

  getRefreshTokenPayload(token: string): JwtPayload{
    return this.jwtRefresh.getTokenPayload(token);
  }

  validitySessionToken(token: string){
    return this.jwtSession.verifyTokenValidity(token);
  }

  validityRefreshToken(token: string){
    return this.jwtRefresh.verifyTokenValidity(token);
  }
  
  generateTokens(data: JwtPayload) {
    const sessionToken = this.generateSessionToken(data);
    const refreshToken = this.generateRefreshToken(data);
  
    return { sessionToken, refreshToken };
  }

  generateSessionToken(data: JwtPayload){
    const token: string = this.jwtSession.generateToken(data, "1h");
    return token;
  }

  async generateRefreshToken(data: JwtPayload){
    const token: string = this.jwtRefresh.generateToken(data, "7d");
    await this.postHashRefreshToken(token);
    return token;
  }

  private async postHashRefreshToken(token: string){
    const payload: JwtPayload = this.getRefreshTokenPayload(token);
    const userID: number = payload.id;
    const tokenHash: string = await bcrypt.hash(token, saltRounds);
    const iat: number = payload.iat ?? 0; 

    if (iat === 0) {
      throw new Error('Invalid refresh token: iat is missing or invalid');
    }
    await this.refreshTokenModel.insertRefreshToken(tokenHash, userID, iat);
  }
}