import { FastifyInstance } from "fastify";
import UserControl from "../controller/UserControl";
import DbService from "../services/DbService";
import { sendResponse } from "../utils/sendReponse";
import UsersModel from "../model/UsersModel";
import verifyAuth from "../middleware/verifyAuth";

export default async function UserRouter(app: FastifyInstance, injections: { db: DbService}) {
  const usersModel = new UsersModel(injections.db);
  const userControl = new UserControl(usersModel);

  app.get("/users", {preHandler: verifyAuth}, async (_, reply) => {
    try {
      const data = await userControl.getAllUsers();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in GET /users:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.post("/users", async (request, reply) => {
    const {username, password} = request.body as {username: string, password: string}
    try {
      const data = await userControl.postUser(username, password);
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in POST /login:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });
}
