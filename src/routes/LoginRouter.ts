import { FastifyInstance } from "fastify";
import LoginControl from "../controller/LoginControl";
import { DbService } from "../services/DbService";

export default async function LoginRouter(app: FastifyInstance, db: DbService) {
  const loginControl = new LoginControl(db);

  app.get("/login", async (_, reply) => {
    try {
      const data = await loginControl.get();
      return reply.code(200).send(data);
    } catch (error) {
      console.error("[Error in GET /login:]", error);
      return reply.code(500).send(error); 
    }
  });

  app.post("/login", async (_, reply) => {
    try {
      const data = await loginControl.post();
      return reply.code(200).send(data);
    } catch (error: any) {
      console.error("[Error in POST /login:]", error);
      return reply.code(500).send(error);
    }
  });
}