import { JwtPayload } from "jsonwebtoken";
import JWTService from "./JWTService";

export default class JWTSessionRefreshService{

  constructor(private jwtSession: JWTService, private jwtRefresh: JWTService){}

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
    return token;
  }
}