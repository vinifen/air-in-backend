import { FastifyReply } from 'fastify';

export const sendResponse = (
  reply: FastifyReply, 
  statusCode: number, 
  data: any,
  status: any = statusCode >= 200 && statusCode < 300 
) => {
  return reply
    .code(statusCode)
    .header("Content-Type", "application/json")
    .send(JSON.stringify({ status: status, data }));
}