import { FastifyInstance } from "fastify";
import DbService from "../services/DbService";
import AuthControl from "../controller/AuthControl";
import UsersModel from "../model/UsersModel";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import { sendResponse } from "../utils/sendReponse";
import { sendCookie } from "../utils/sendCookie";
import RefreshTokenModel from "../model/RefreshTokenModel";

export default function AuthRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService }){
  const refreshTokenModel = new RefreshTokenModel(injections.db);
  const usersModel = new UsersModel(injections.db);
  const authControl = new AuthControl(usersModel, refreshTokenModel, injections.jwtSessionRefreshS);

  app.post("/auth/login", async (request, reply) => {
    const {username, password} = request.body as {username: string, password: string};
    try{
      const data = await authControl.loginUser(username, password);
      if (!data.statusLogin) {
        return sendResponse(reply, 401, data);
      }
      const { statusLogin, sessionToken, refreshToken, message } = data;

      if (!sessionToken || !refreshToken) {
        return sendResponse(reply, 500, { message: "Failed to generate tokens" });
      }
      
      sendCookie(reply, "sessionToken", sessionToken);
      sendCookie(reply, "refreshToken", refreshToken);
      
      return sendResponse(reply, 200, { message, statusLogin});
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
      
      if(await data.newRefreshToken && data.newSessionToken){
        sendCookie(reply, "sessionToken", data.newSessionToken);
        sendCookie(reply, "refreshToken", await data.newRefreshToken);
      }
      console.log(data);
      return sendResponse(reply, data.statusCode, {message: data.message});
    } catch (error: any) {
      console.error("[Error in POST /auth/refresh-token:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  })
}