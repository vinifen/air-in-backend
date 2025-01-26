import jwt, { JwtPayload } from 'jsonwebtoken';

export default class JWTService {
  private readonly jwtKey: string;

  constructor (key: string){
    this.jwtKey = key;
  }

  generateToken(paylod: JwtPayload, expires: string){
    return jwt.sign(paylod, this.jwtKey, {expiresIn: expires})
  }

  verifyTokenValidity(token: string){
    try {
      jwt.verify(token, this.jwtKey);
      console.log("TRUE VERIFYTOKEN")
      return true;
    } catch (error: any) {
      console.log("FALSE VERIFYTOKEN")
      return false;
    }
  }

  getTokenPayload(token: string): JwtPayload | null {
    try {      
      return jwt.verify(token, this.jwtKey) as JwtPayload;
    } catch (error: any) {
      return null;
    }
  }
}