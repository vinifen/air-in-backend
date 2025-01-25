import { JwtPayload } from "jsonwebtoken";
import JWTService from "./JWTService";
import { uuidv7 } from "uuidv7";

export default class JWTSessionRefreshService {
  constructor(private jwtSession: JWTService, private jwtRefresh: JWTService) {}

  getSessionTokenPayload(token: string): JwtPayload {
    const data = this.jwtSession.getTokenPayload(token);
    if (!data) {
      return { status: false, message: "Error generating session token" };
    }
    return { status: true, data: data };
  }

  getRefreshTokenPayload(token: string): JwtPayload {
    const data = this.jwtRefresh.getTokenPayload(token);
    if (!data) {
      return { status: false, message: "Error generating refresh token" };
    }
    return { status: true, data: data };
  }

  validitySessionToken(token: string) {
    return this.jwtSession.verifyTokenValidity(token);
  }

  validityRefreshToken(token: string) {
    return this.jwtRefresh.verifyTokenValidity(token);
  }

  async generateSessionToken(data: JwtPayload) {
    const publicTokenID = uuidv7();
    const tokenData = { ...data, publicTokenID };
    const token: string = this.jwtSession.generateToken(tokenData, "1h");
    return { token, publicTokenID };
  }

  async generateRefreshToken(data: JwtPayload) {
    const publicTokenID = uuidv7();
    const tokenData = { ...data, publicTokenID };
    const token: string = this.jwtRefresh.generateToken(tokenData, "7d");
    return { token, publicTokenID };
  }

  async generateNewTokens(username: string, publicUserID: string) {
    if (!username || !publicUserID) {
      return { status: false, message: "Error generating tokens: Invalid parameters" };
    }

    const sessionPayload: JwtPayload = { publicUserID, username };
    const { token: sessionToken, publicTokenID: publicSessionTokenID } = 
      await this.generateSessionToken(sessionPayload);

    const refreshPayload: JwtPayload = { publicUserID, username };
    const { token: refreshToken, publicTokenID: publicRefreshTokenID } = 
      await this.generateRefreshToken(refreshPayload);

    if (!refreshToken || !sessionToken) {
      return { status: false, message: "Error generating tokens" };
    }

    return {
      status: true,
      sessionToken,
      refreshToken,
      tokensIDs: {
        publicSessionTokenID,
        publicRefreshTokenID,
      },
    };
  }
}
