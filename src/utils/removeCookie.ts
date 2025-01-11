import { FastifyReply } from 'fastify';
import { configVariables } from './configVariables';

export const removeCookie = (
  reply: FastifyReply,
  cookieName: string,
  path: string = '/',
  secure: boolean = false,
  domain: string = configVariables.SERVER_HOSTNAME,
  sameSite: 'strict' | 'lax' | 'none' = 'lax'
): void => {
  if (!cookieName || !reply) {
    throw new Error('Cookie name and reply are required.');
  }

  reply.clearCookie(cookieName, {
    httpOnly: true,    
    path,              
    secure,   
    domain,          
    sameSite,          
    expires: new Date(0),
  });
};
