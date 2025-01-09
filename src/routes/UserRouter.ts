import { FastifyInstance } from "fastify";
import UserControl from "../controller/UserControl";
import DbService from "../services/DbService";
import { sendResponse } from "../utils/sendReponse";
import UsersModel from "../model/UsersModel";
import { verifyAuth } from "../middleware/verifyAuth";
import { sendCookie } from "../utils/sendCookie";
import JWTSessionRefreshService from "../services/JWTSessionRefreshService";

export default async function UserRouter(app: FastifyInstance, injections: { db: DbService, jwtSessionRefreshS: JWTSessionRefreshService}) {
  const usersModel = new UsersModel(injections.db);
  const userControl = new UserControl(usersModel, injections.jwtSessionRefreshS);

  app.get("/users", {preHandler: verifyAuth(injections.jwtSessionRefreshS)}, async (request, reply) => {
   
    const sessionToken = request.cookies.sessionToken;
    if (!sessionToken) {
      return sendResponse(reply, 400, { message: "Session token is required" });
    }
   
    try {
      const data = await userControl.getUser(sessionToken);
      return sendResponse(reply, 200, { content: {username: data[0].username}, sessionTokenStatus: true,});
    } catch (error: any) {
      console.error("[Error in GET /users:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.post("/users", async (request, reply) => {
    
    const {username, password} = request.body as {username: string, password: string}
    try {
      const data = await userControl.postUser(username, password);

      if(data.status == false){
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
      return sendResponse(reply, 201, { message: `Successfully created user`, content: {username: data.username}});

    } catch (error: any) {
      console.error("[Error in POST /users:]", error);
      return sendResponse(reply, 500, { message: error.message || error });
    }
  });
}
