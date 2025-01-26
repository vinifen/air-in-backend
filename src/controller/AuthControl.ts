import { JwtPayload } from "jsonwebtoken";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";



export default class AuthControl {
  constructor(
    private jwtSessionRefresh: JWTSessionRefreshService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async loginUser(usnm: string, pswd: string, rememberMe: boolean){
    const response = await this.userService.getUserDataByUsername(usnm);
    if(!response){
      return {status: false, statusCode: 400, message: "Invalid Credentials."}
    }

    const checkUsername = await this.userService.checkIfUsernameExists(usnm)
    if(!checkUsername){
      return {status: false, statusCode: 400, message: "Username not found."}
    }

    if(response.username !== usnm){
      return {status: false, statusCode: 400, message: "Invalid Credentials."}
    }
  
    const resultHashPassword = await this.userService.getHashPassword(response.userID);
    if(!resultHashPassword.status){
      return {status: false, statusCode: 500, message: resultHashPassword.message}
    }
    const hashPassword = resultHashPassword.password
    const isPasswordValid = await this.authService.validatePassword(pswd, hashPassword);
    if(!isPasswordValid.status){
      return {status: false, statusCode: isPasswordValid.status, message: isPasswordValid.message}
    }

    if(rememberMe === false){
      const newSessionPayload: JwtPayload = { publicUserID: response.publicUserID, username: response.username };
      const resultSessionToken = await this.jwtSessionRefresh.generateSessionToken(newSessionPayload)
      return {
        status: true, 
        statusCode: 200, 
        sessionToken: resultSessionToken.token, 
        message: "Successfully logged in",
        username: response.username,
        publicUserID: response.publicUserID,
      }
    }

    const result = await this.authService.handlerTokens(response.userID, response.username, response.publicUserID);
    if(!result || !result.status){
      return { status: false, statusCode: result.statusCode}
    }

    return {
      status: true,
      statusCode: 200,
      username: response.username,
      publicUserID: response.publicUserID,
      sessionToken: result.sessionToken,   
      refreshToken: result.refreshToken,   
      message: "Successfully logged in"
    };
  }

  async regenerateTokens(refreshToken: string) {
    const getPayload = this.jwtSessionRefresh.getRefreshTokenPayload(refreshToken);
    if(!getPayload.status){
      return {statusCode: 400, message: getPayload.message}
    }
    const payload: JwtPayload = getPayload.data;
    
    const resultUserData = await this.userService.verifyPublicUserIdData(payload.publicUserID)
    if(!resultUserData){
      return {
        statusCode: 400,
        message: "Error getting user data",
      };
    }

    console.log(payload,  "REFRESH TOKEN PAYLOAD REGENERATE TOKENS");
    console.log(resultUserData.userID, "USER ID EM RegenerateTokens");
    
    if(!this.jwtSessionRefresh.validityRefreshToken(refreshToken)){
      return {
        statusCode: 400,
        message: "Invalid refresh token",
      };
    }

    const verifyHashRT = await this.authService.isHashRefreshTokenValid(resultUserData.userID, payload.publicTokenID);
    console.log(verifyHashRT,  "VERIFY HASH TOKEN");
    if(verifyHashRT.status === false){
      return {
        statusCode: verifyHashRT.statusCode, 
        message: verifyHashRT.message
      }
    }

    const result = await this.authService.handlerTokens(resultUserData.userID, payload.username, payload.publicUserID)
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

  async logout(refreshToken: string){
    //C
    console.log(refreshToken, "REFRESH TOKEN LOGOUT CONTROL")
    const payload = this.authService.verifyRefreshTokenPayload(refreshToken);
    console.log(payload, "AQUI LOGOUT")
    if(payload && payload.publicUserID && payload.publicTokenID){
      const resultUserData = await this.userService.verifyPublicUserIdData(payload.publicUserID)
      console.log(resultUserData, "RESULT USER DATA LOGOUT");
      if(!resultUserData){
        return {
          statusCode: 400,
          message: "Error getting user data",
        };
      }
      const publicTokenID: string = payload.publicTokenID;
      const resultDeleteOldRT = await this.authService.deleteOldHashRefreshToken(resultUserData.userID, publicTokenID);
      console.log(resultDeleteOldRT, "resultDeletOldRT");

    }
  }

}