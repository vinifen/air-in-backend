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

export default async function UserRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService, authService: AuthService}) {
  const usersModel = new UsersModel(injections.db);
  const userControl = new UserControl(usersModel, injections.jwtSessionRefreshS, injections.authService);

  app.get("/users", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
    const {sessionToken} = request.cookies as {sessionToken: string}
   
    try {
      const data = await userControl.getUser(sessionToken);
      return sendResponse(reply, 200, { content: {publicUserID: data.publicUserID, username: data.username}, sessionTokenStatus: true,});
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
        return sendResponse(reply, 409, {message: data.message});
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
   
    try {
      
    } catch (error: any) {
      
    }
  });
}
