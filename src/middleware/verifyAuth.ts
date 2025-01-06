import { FastifyRequest, FastifyReply } from 'fastify';
import JWTSessionRefreshService from '../services/JWTSessionRefreshService';
import { sendResponse } from '../utils/sendReponse';

export const verifyAuth = (sessionRefreshJWT: JWTSessionRefreshService) => {
  console.log("USERS TESTE");
  return async function (request: FastifyRequest, reply: FastifyReply) {
    console.log("USERS TESTE");
    const sessionToken: string | undefined = request.cookies ? request.cookies.sessionToken : undefined;
    const refreshToken: string | undefined = request.cookies ? request.cookies.refreshToken : undefined;
    const refreshTokenExist: boolean = refreshToken ? true : false;

    if(!sessionToken){
      return sendResponse(
        reply,
        200, 
        {
          sessionTokenStatus: false, 
          hasRefreshToken: refreshTokenExist, 
          message: "Session token not found"
        },
        false
      );
    }
    
    if(sessionRefreshJWT.validitySessionToken(sessionToken) == false){
      return sendResponse(
        reply, 
        200, 
        {
          sessionTokenStatus: false, 
          hasRefreshToken: refreshTokenExist, 
          message: "Invalid token"
        }, 
        false
        );
    }
  }
}
