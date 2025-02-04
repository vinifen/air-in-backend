import { FastifyReply } from 'fastify';
import { configVariables } from './configVariables';

export const removeCookie = (
  reply: FastifyReply,
  cookieName: string,
  path: string = '/',
  secure: boolean = false,
  sameSite: 'strict' | 'lax' | 'none' = 'lax'
): void => {
  if (!cookieName || !reply) {
    throw new Error('Cookie name and reply are required.');
  }

  reply.clearCookie(cookieName, {
    httpOnly: true,    
    path,              
    secure,           
    sameSite,          
    expires: new Date(0),
  });
};
