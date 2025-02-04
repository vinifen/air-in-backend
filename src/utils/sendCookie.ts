import { FastifyReply } from 'fastify';

export const sendCookie = (
  reply: FastifyReply,
  cookieName: string,
  data: string,
  maxAge: number = 3600,
  httpOnly: boolean = true,
  path: string = '/',
  secure: boolean = false,
  sameSite: 'strict' | 'lax' | 'none' = 'lax'
): void => {
  if (!cookieName || !data || !reply) {
    throw new Error('Cookie name, data and reply are required.');
  }

  reply.setCookie(cookieName, data, {
    httpOnly,
    path,
    maxAge,
    secure,
    sameSite
  });
};
