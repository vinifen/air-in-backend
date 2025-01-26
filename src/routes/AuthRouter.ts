import { FastifyInstance } from "fastify";
import DbService from "../services/DbService";
import AuthControl from "../controller/AuthControl";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import { sendResponse } from "../utils/sendReponse";
import { sendCookie } from "../utils/sendCookie";
import RefreshTokenModel from "../model/RefreshTokenModel";
import { removeCookie } from "../utils/removeCookie";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";

export default function AuthRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService, userService: UserService}){
  const refreshTokenModel = new RefreshTokenModel(injections.db);
  const authService = new AuthService(injections.jwtSessionRefreshS,refreshTokenModel)
  const authControl = new AuthControl(injections.jwtSessionRefreshS, authService, injections.userService);

  app.post("/auth/login", async (request, reply) => {
    const {username, password, rememberMe} = request.body as {username: string, password: string, rememberMe: boolean};
    try{
      const data = await authControl.loginUser(username, password, rememberMe);
      if (!data.status || !data.sessionToken) {
        return sendResponse(reply, data.statusCode || 400, {message: data.message});
      }
      
      if (rememberMe) {
        if (data.sessionToken && data.refreshToken) {
          sendCookie(reply, "sessionToken", data.sessionToken, 7 * 24 * 60 * 60 * 1000);
          sendCookie(reply, "refreshToken", data.refreshToken, 3600 * 1000);
        }
      } else if (data.sessionToken && !data.refreshToken) {
        sendCookie(reply, "sessionToken", data.sessionToken, 7 * 24 * 60 * 60 * 1000);
      }
  
      return sendResponse(reply, data.statusCode, {content: { publicUserID: data.publicUserID, username: data.username}, message: data.message});

    } catch (error: any) {
      console.error("[Error in POST /auth/login:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  })

  app.post("/auth/refresh-token", async (request, reply) => {
    const refreshToken: string | undefined = request.cookies.refreshToken;
 
    if (!refreshToken) {
      return sendResponse(reply, 400, { message: "Refresh token is required" });
    }

    try {
      const data = await authControl.regenerateTokens(refreshToken);
      
      if(data.newRefreshToken && data.newSessionToken){
        sendCookie(
          reply, 
          "sessionToken", 
          data.newSessionToken,
          7 * 24 * 60 * 60 * 1000
        );
        sendCookie(
          reply, 
          "refreshToken", 
          data.newRefreshToken,
          3600 * 1000
        );
      }else{
        removeCookie(reply, "sessionToken");
        removeCookie(reply, "refreshToken");
      }
  
      return sendResponse(reply, data.statusCode, {message: data.message});

    } catch (error: any) {
      console.error("[Error in POST /auth/refresh-token:]", error);
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      return sendResponse(reply, 500, { message: error.message});
    }
  })

  app.post("/auth/logout", async (request, reply) => {
    const refreshToken: string | undefined = request.cookies.refreshToken;
  
    try {
      if(refreshToken){
        await authControl.logout(refreshToken);
      }
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      return sendResponse(reply, 200, {message: "Logged out"});

    } catch (error: any) {
      console.error("[Error in POST /auth/logout:]", error);
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      return sendResponse(reply, 500, { message: error.message});
    }
  })
}