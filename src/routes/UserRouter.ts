import { FastifyInstance } from "fastify";
import UserControl from "../controller/UserControl";
import DbService from "../services/DbService";
import { sendResponse } from "../utils/sendReponse";
import { verifyAuth } from "../middleware/verifyAuth";
import { sendCookie } from "../utils/sendCookie";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import { removeCookie } from "../utils/removeCookie";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import CityService from "../services/CityService";
import RefreshTokenModel from "../model/RefreshTokenModel";
import CitiesModel from "../model/CitiesModel";

export default async function UserRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService, userService: UserService}) {
  const citiesModel = new CitiesModel(injections.db);
  const refreshTokenModel = new RefreshTokenModel(injections.db);
  const cityService = new CityService(citiesModel)
  const authService = new AuthService(injections.jwtSessionRefreshS ,refreshTokenModel);
  const userControl = new UserControl(injections.jwtSessionRefreshS, authService, injections.userService, cityService);

  app.get("/users", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string}
   
    try {
      const data = await userControl.getUser(sessionToken);
      if(!data.status){
        removeCookie(reply, "sessionToken");
        removeCookie(reply, "refreshToken");
        return sendResponse(reply, 200, {message: "Invalid session"});
      }
      return sendResponse(reply, 200, { content: {publicUserID: data.publicUserID, username: data.username}, stStatus: true,});
    } catch (error: any) {
      console.error("[Error in GET /users:]", error);
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });


  app.post("/users", async (request, reply) => {
    const { username, password, rememberMe } = request.body as { username: string; password: string; rememberMe: boolean };
  
    try {
      const data = await userControl.postUser(username, password, rememberMe);
  
      if (!data.status) {
        return sendResponse(reply, 400, { message: data.message });
      }
  
      if (rememberMe) {
        if (data.sessionToken && data.refreshToken) {
          sendCookie(reply, "sessionToken", data.sessionToken, 7 * 24 * 60 * 60 * 1000);
          sendCookie(reply, "refreshToken", data.refreshToken, 3600 * 1000);
        }
      } else if (data.sessionToken && !data.refreshToken) {
        sendCookie(reply, "sessionToken", data.sessionToken, 7 * 24 * 60 * 60 * 1000);
      }
  
      return sendResponse(reply, 201, {
        message: `Successfully created user`,
        content: { publicUserID: data.publicUserID, username: data.username }
      });
      
    } catch (error: any) {
      console.error("[Error in POST /users:]", error);
      return sendResponse(reply, 500, { message: error.message || "Unexpected error occurred" });
    }
  });


  app.delete("/users", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string};
    const {password} = request.body as {password: string};
   
    try {
      const data = await userControl.deleteUser(sessionToken, password);
      if(!data.status){
        return sendResponse(reply, 401, {message: data.message})
      }
      removeCookie(reply, "sessionToken");
      removeCookie(reply, "refreshToken");
      return sendResponse(reply, 200, {message: data.message})
    } catch (error: any) {
      console.error("[Error in DELETE /users:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });


  app.put("/users/username", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string};
    const {newUsername} = request.body as {newUsername: string}
    const {password} = request.body as {password: string};
    
    try {
      const data = await userControl.editUsername(newUsername, sessionToken, password);

      if(!data.status){
        return sendResponse(reply, 400, {message: data.message});
      }
      if(data.sessionToken && data.refreshToken){ 
        sendCookie(
          reply, 
          "sessionToken", 
          data.sessionToken,
          7 * 24 * 60 * 60 * 1000,
        );
        sendCookie(
          reply, 
          "refreshToken", 
          data.refreshToken,
          3600 * 1000, 
        );
      }
      return sendResponse(reply, 201, { message: `Successfully username edited`, content: {publicUserID: data.publicUserID, username: data.username}});
    } catch (error: any) {
      console.error("[Error in PUT /users/username:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });


  app.put("/users/password", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string};
    const {newPassword} = request.body as {newPassword: string}
    const {oldPassword} = request.body as {oldPassword: string};
    
    try {
      const data = await userControl.editPassword(newPassword, sessionToken, oldPassword);

      if(!data.status){
        return sendResponse(reply, 400, {message: data.message});
      }
      if(data.sessionToken && data.refreshToken){ 
        sendCookie(
          reply, 
          "sessionToken", 
          data.sessionToken,
          7 * 24 * 60 * 60 * 1000,
        );
        sendCookie(
          reply, 
          "refreshToken", 
          data.refreshToken,
          3600 * 1000, 
        );
      }
      return sendResponse(reply, 201, { message: `Successfully password edited`, content: {publicUserID: data.publicUserID, username: data.username}});
    } catch (error: any) {
      console.error("[Error in PUT /users/password:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });
}
