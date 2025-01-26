import { FastifyRequest, FastifyReply } from 'fastify';
import JWTSessionRefreshService from '../services/JWTSessionRefreshService';
import { sendResponse } from '../utils/sendReponse';


export const verifyAuth = (sessionRefreshJWT: JWTSessionRefreshService) => {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const sessionToken: string | undefined = request.cookies ? request.cookies.sessionToken : undefined;
    const refreshToken: string | undefined = request.cookies ? request.cookies.refreshToken : undefined;
    const refreshTokenExist: boolean = refreshToken ? true : false;
    
    if (!sessionToken) {
      return sendResponse(
        reply,
        200, 
        {
          stStatus: false, 
          hasRt: refreshTokenExist, 
          message: "Invalid token"
        },
        false
      );
    }

    if (!sessionRefreshJWT.validitySessionToken(sessionToken)) {
      return sendResponse(
        reply,
        200, 
        {
          stStatus: false, 
          hasRt: refreshTokenExist, 
          message: "Invalid token"
        },
        false
      );
    }
  }
}
