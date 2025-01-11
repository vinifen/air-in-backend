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
  
  async generateSessionToken(data: JwtPayload){
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

    const tokenHash: string = await bcrypt.hash(token, saltRounds);
    console.log(tokenHash, payload, "NEW TOKEN HASH E PAYLOAD EM POST REFRESH TOKEN");
    console.log(payload.userId, "USERIDD");
    await this.refreshTokenModel.insertRefreshToken(tokenHash, payload.userID, payload.publicTokenID);
  }
}