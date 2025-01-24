import { FastifyInstance } from "fastify";
import UserControl from "../controller/UserControl";
import DbService from "../services/DbService";
import { sendResponse } from "../utils/sendReponse";
import UsersModel from "../model/UsersModel";
import { verifyAuth } from "../middleware/verifyAuth";
import { sendCookie } from "../utils/sendCookie";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";
import { removeCookie } from "../utils/removeCookie";
import AuthControl from "../controller/AuthControl";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import CityService from "../services/CityService";

export default async function UserRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService, authService: AuthService, cityService: CityService}) {
  const usersModel = new UsersModel(injections.db);
  const userService = new UserService(usersModel);
  const userControl = new UserControl(injections.jwtSessionRefreshS, injections.authService, userService, injections.cityService);

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
    const {username, password} = request.body as {username: string, password: string}
  
    try {
      const data = await userControl.postUser(username, password);

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
      return sendResponse(reply, 201, { message: `Successfully created user`, content: {publicUserID: data.publicUserID, username: data.username}});

    } catch (error: any) {
      console.error("[Error in POST /users:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.delete("/users", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string};
    const {refreshToken} = request.cookies as {refreshToken: string};
    const {password} = request.body as {password: string};
   
    try {
      const data = await userControl.deleteUser(sessionToken, refreshToken, password);
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
