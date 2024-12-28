import { FastifyInstance } from "fastify";
import LoginControl from "../controller/LoginControl";
import DbService from "../services/DbService";
import { sendResponse } from "../services/sendReponse";

export default async function LoginRouter(app: FastifyInstance, db: DbService) {
  const loginControl = new LoginControl(db);

  app.get("/login", async (_, reply) => {
    try {
      const data = await loginControl.get();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in GET /login:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });

  app.post("/login", async (_, reply) => {
    try {
      const data = await loginControl.post();
      sendResponse(reply, 200, data);
    } catch (error: any) {
      console.error("[Error in POST /login:]", error);
      sendResponse(reply, 500, { message: error.message || error });
    }
  });
}
