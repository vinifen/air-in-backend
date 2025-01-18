import { FastifyInstance } from "fastify";
import DbService from "../services/DbService";
import AuthControl from "../controller/AuthControl";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import { sendResponse } from "../utils/sendReponse";
import { sendCookie } from "../utils/sendCookie";
import RefreshTokenModel from "../model/RefreshTokenModel";
import { removeCookie } from "../utils/removeCookie";

export default function AuthRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService }){
  const refreshTokenModel = new RefreshTokenModel(injections.db);
  const usersModel = new UsersModel(injections.db);
  const authControl = new AuthControl(usersModel, refreshTokenModel, injections.jwtSessionRefreshS);

  app.post("/auth/login", async (request, reply) => {
    const {username, password} = request.body as {username: string, password: string};
    try{
      const data = await authControl.loginUser(username, password);
      if (data.statusCode != 200) {
        return sendResponse(reply, 401, {message: data.message});
      }

      if (!data.sessionToken || !data.refreshToken) {
        return sendResponse(reply, 500, { message: "Tokens not found" });
      }
      
      sendCookie(reply, "sessionToken", data.sessionToken);
      sendCookie(reply, "refreshToken", data.refreshToken);
  
      return sendResponse(reply, data.statusCode, {content: { publicUserID: data.publicUserID, username: data.username}, message: data.message});

    } catch (error: any) {
      console.error("[Error in POST /auth/login:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  })

  app.post("/auth/refresh-token", async (request, reply) => {
    const refreshToken: string | undefined = request.cookies.refreshToken;
    console.log(refreshToken, "TESTEEEEE");
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
      console.log(data);
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
    console.log(refreshToken, "RT logout");
    try {
      if(refreshToken){
        await authControl.logout(refreshToken);
      }
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      console.log("FIM LOGOUT")
      return sendResponse(reply, 200, {message: "Logged out"});

    } catch (error: any) {
      console.error("[Error in POST /auth/logout:]", error);
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      console.log("FIM ERRO LOGOUT")
      return sendResponse(reply, 500, { message: error.message});
    }
  })
}