import { JwtPayload } from "jsonwebtoken";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import CityService from "../services/CityService";

export default class UserControl {

  constructor(
    private jwtSessionRefreshService: JWTSessionRefreshService, 
    private authService: AuthService,
    private userService: UserService,
    private cityService: CityService
  ) {}


  async getUser(sessionToken: string) {
    const resultPayload = this.jwtSessionRefreshService.getSessionTokenPayload(sessionToken);
    if(!resultPayload.status || !resultPayload.data){
      return {status: false, message: resultPayload.message}
    }
    const payload: JwtPayload = resultPayload.data;
    console.log(payload, "PAYLOAD GETUSER")

    const publicUserIDValidity = await this.userService.verifyPublicUserIdData(payload.publicUserID);
    if(!publicUserIDValidity.status){
      return {status: false, message: "User not found"}
    }
    
    return {
      status: true,
      publicUserID: publicUserIDValidity.publicUserID,
      username: publicUserIDValidity.username,
    };
  }
  

  async postUser(username: string, password: string, rememberMe: boolean) {
    const usernameValidity = await this.userService.checkIfUsernameExists(username);
    if(usernameValidity){
      return {status: false, message: `Username ${username} is already registered.`}
    }

    const resultNewUser = await this.userService.addNewUser(username, password);
    if(!resultNewUser.status){
      return {status: false, message: resultNewUser.message}
    }

    const resultUserData = await this.userService.getUserDataByUsername(username);
    if(!resultUserData){
      return {status: false, message: "Error getting user data"}
    }

    if(rememberMe === false){
      const newSessionPayload: JwtPayload = { publicUserID: resultUserData.publicUserID, username: resultUserData.username };
      const resultSessionToken = await this.jwtSessionRefreshService.generateSessionToken(newSessionPayload)
      return {
        status: true, 
        sessionToken: resultSessionToken.token, 
        message: "Successfully logged in",
        username: resultUserData.username,
        publicUserID: resultUserData.publicUserID 
      }
    }

    const resultNewTokens = await this.authService.handlerTokens(resultUserData.userID, resultUserData.username, resultUserData.publicUserID);
    if(!resultNewTokens.status){
      return {status: false, message: resultNewTokens.message}
    }
    
    return {
      status: true,
      username: resultUserData.username,
      publicUserID: resultUserData.publicUserID,
      sessionToken: resultNewTokens.sessionToken,   
      refreshToken: resultNewTokens.refreshToken,   
      message: "Successfully logged in"
    }
  }


  async deleteUser(sessionToken: string, password: string){
    if(!this.jwtSessionRefreshService.validitySessionToken(sessionToken) || !password){
      return {status: false, message: "Invalid entries"}
    }

    const getUserData = await this.userService.getUserDataBySessionToken(sessionToken);
    if(!getUserData.status || !getUserData.data){
      return {status: false, statusCode: getUserData.statusCode, message: getUserData.message}
    }
    const resultUserData = getUserData.data;

    const resultHashPassword = await this.userService.getHashPassword(resultUserData.userID);
    if(!resultHashPassword.status){
      return {status: false, message: resultHashPassword.message}
    }
    const hashPassword = resultHashPassword.password
    const isPasswordValid = await this.authService.validatePassword(password, hashPassword);
    if( !isPasswordValid.status){
      return { status: isPasswordValid.status, message: isPasswordValid.message}
    }

    const resultDeleteRefreshTokens = await this.authService.deleteAllUserRefreshTokens(resultUserData.userID);
    if(!resultDeleteRefreshTokens.status){
      return { status: false, message: resultDeleteRefreshTokens.message}
    }

    const resultDeleteCities = await this.cityService.deleteAllUserCities(resultUserData.userID, isPasswordValid.status);
    if(!resultDeleteCities.status){
      return {status: false, message: resultDeleteCities.message}
    }

    const resultDeleteUser = await this.userService.deleteUserData(resultUserData.userID, isPasswordValid.status);
    if(!resultDeleteUser.status){
      return {status: false, message: resultDeleteUser.message}
    }

    return {status: true, message: "Account successfully deleted"}
  }


  async editUsername(newUsername: string, sessionToken: string, password: string){
    
    if(!this.jwtSessionRefreshService.validitySessionToken(sessionToken)){
      return {status: false, message: "Invalid token"}
    }

    const resultPayload = this.jwtSessionRefreshService.getSessionTokenPayload(sessionToken)
    if(!resultPayload.status || !resultPayload.data){
      return {status: false, message: "Error getting token data"}
    }   
    const payload: JwtPayload = resultPayload.data;
    const resultUserData = await this.userService.verifyPublicUserIdData(payload.publicUserID)
    console.log("RESULST USERDATA PUT USERNAME", resultUserData);
    const resultHashPassword = await this.userService.getHashPassword(resultUserData.userID);
    if(!resultHashPassword.status){
      return {status: false, message: resultHashPassword.message}
    }
    const hashPassword = resultHashPassword.password
    const isPasswordValid = await this.authService.validatePassword(password, hashPassword);
    if( !isPasswordValid.status){
      return { status: isPasswordValid.status, message: isPasswordValid.message}
    }

    const resultUpdateUsername = await this.userService.updateUsername(newUsername, resultUserData.userID)
    if(!resultUpdateUsername.status){
      return {status: false, message: resultUpdateUsername.message}
    }

    const resultNewTokens = await this.authService.handlerTokens(resultUserData.userID, resultUserData.username, resultUserData.publicUserID)
    if(!resultNewTokens.status){
      return {status: false, message: resultNewTokens.message}
    }
    
    return {
      status: true,
      username: resultUserData.username,
      publicUserID: resultUserData.publicUserID,
      sessionToken: resultNewTokens.sessionToken,   
      refreshToken: resultNewTokens.refreshToken,   
      message: "Successfully username edited"
    }
  }
  

  async editPassword(newPassword: string, sessionToken: string, oldPassword: string){
    
    if(!this.jwtSessionRefreshService.validitySessionToken(sessionToken)){
      return {status: false, message: "Invalid token"}
    }

    const resultPayload = this.jwtSessionRefreshService.getSessionTokenPayload(sessionToken)
    if(!resultPayload.status || !resultPayload.data){
      return {status: false, message: "Error getting token data"}
    }   
    const payload: JwtPayload = resultPayload.data;
    const resultUserData = await this.userService.verifyPublicUserIdData(payload.publicUserID)
    console.log("RESULST USERDATA PUT PASSWORD", resultUserData);
    const resultHashPassword = await this.userService.getHashPassword(resultUserData.userID);
    if(!resultHashPassword.status){
      return {status: false, message: resultHashPassword.message}
    }
    const hashPassword = resultHashPassword.password
    const isPasswordValid = await this.authService.validatePassword(oldPassword, hashPassword);
    if( !isPasswordValid.status){
      return { status: isPasswordValid.status, message: isPasswordValid.message}
    }

    const resultUpdateUsername = await this.userService.updatePassword(newPassword, resultUserData.userID)
    if(!resultUpdateUsername.status){
      return {status: false, message: resultUpdateUsername.message}
    }

    const resultDeleteRefreshTokens = await this.authService.deleteAllUserRefreshTokens(resultUserData.userID);
    if(!resultDeleteRefreshTokens.status){
      return { status: false, message: resultDeleteRefreshTokens.message}
    }

    const resultNewTokens = await this.authService.handlerTokens(resultUserData.userID, resultUserData.username, resultUserData.publicUserID)
    if(!resultNewTokens.status){
      return {status: false, message: resultNewTokens.message}
    }
    
    return {
      status: true,
      username: resultUserData.username,
      publicUserID: resultUserData.publicUserID,
      sessionToken: resultNewTokens.sessionToken,   
      refreshToken: resultNewTokens.refreshToken,   
      message: "Successfully password edited"
    }
  }

}
