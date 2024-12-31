import { FastifyRequest, FastifyReply } from 'fastify';

export default async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  console.log("Teste EnsureAuth", request, reply);

  
    return reply.redirect('/cities/weather');
  

}
