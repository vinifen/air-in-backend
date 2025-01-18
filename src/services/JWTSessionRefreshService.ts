import { JwtPayload } from "jsonwebtoken";
import JWTService from "./JWTService";
import { uuidv7 } from "uuidv7";

export default class JWTSessionRefreshService{

  constructor(private jwtSession: JWTService, private jwtRefresh: JWTService){}

  getSessionTokenPayload(token: string): JwtPayload{
    const data = this.jwtSession.getTokenPayload(token);
    if(!data){
      return {status: false, message: "Error generating session token"}
    }
    return {status: true, data: data}
  }

  getRefreshTokenPayload(token: string): JwtPayload{
    const data = this.jwtRefresh.getTokenPayload(token);
    if(!data){
      return {status: false, message: "Error generating refresh token"}
    }
    return {status: true, data: data}
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
  

  async generateNewTokens(username: string, publicUserID: string){
    if(!username || !publicUserID){
      return {status: false, message: "Error generating tokens: Invalid parameters"}
    }
    const newPublicSessionTokenID = uuidv7();
    const newPublicRefreshTokenID = uuidv7();
    
    const payloadSessionToken: JwtPayload = { publicUserID: publicUserID, username: username, publicTokenID: newPublicSessionTokenID }
    const sessionToken: string = await this.generateSessionToken(payloadSessionToken);

    const payloadRefreshToken: JwtPayload = { publicUserID: publicUserID, username: username, publicTokenID: newPublicRefreshTokenID }
    const refreshToken: string = await this.generateRefreshToken(payloadRefreshToken);
    if(!refreshToken || !sessionToken){
      return {status: false, message: "Error generating tokens"}
    }
    
    return {
      status: true, 
      sessionToken: sessionToken, 
      refreshToken: refreshToken, 
      tokensIDs: {
        publicSessionTokenID: newPublicSessionTokenID,
        publicRefreshTokenID: newPublicRefreshTokenID
      }
    }
  }

  
}