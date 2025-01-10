import { RowDataPacket } from "mysql2";
import DbService from "../services/DbService";

export default class RefreshTokenModel {
  constructor(private dbService: DbService){}

  async insertRefreshToken(token: string, userID: number, iat: number){
    const query = "INSERT INTO refresh_tokens (token, id_users, iat) VALUES (?,?,?)";
    if(!token || !userID || !iat){
      throw new Error('Failed to insert refresh token: Invalid parameters provided.')
    }
    const response: RowDataPacket [] = await this.dbService.getQuery(query, [token, userID, iat]);

    if (response) {
      return { message: "Refresh token inserted successfully", response: response };
    } else {
      throw new Error("Failed to insert refresh token");
    }
  }

  async selectHashRefreshTokenByUserID(userID: number, iat: number){
    console.log(userID, iat, "USERID IAT");
    if(!userID || !iat){
      throw new Error('Failed to select refresh token: Invalid parameters provided.')
    }
    const query = "SELECT * FROM refresh_tokens WHERE id_users = ? AND iat = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID, iat]);
    if(response.length === 0){
      throw new Error('Token not found');
    }

    const token = response[0];

    return {
      tokenID: token.id,
      token: token.token,
      iat: token.iat,
    };
  }

  async selectHashRefreshTokenByHashToken(hashToken: string){
    console.log(hashToken)
    if(!hashToken){
      throw new Error('Failed to select refresh: Invalid parameters provided.')
    }
    const query = "SELECT * FROM refresh_tokens WHERE token = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [hashToken]);
    if(response.length === 0){
      return {status: false, message: "Hash token not found"}
    }

    const token = response[0];

    return {
      tokenID: token.id,
      token: token.token,
      iat: token.iat,
    };
  }

  async deleteRefreshTokenByHashToken(hashToken: string){
    if(!hashToken){
      throw new Error('Failed to delete refresh token: Invalid parameters provided.')
    }
    if((await this.selectHashRefreshTokenByHashToken(hashToken)).status === false){
      return {status: false, message: "Hash token not found"}
    }
    const query = "DELETE FROM refresh_tokens WHERE token = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [hashToken]);
    if (response) {
      return { message: "Refresh token delete successfully", response: response };
    } else {
      throw new Error("Failed to delete refresh token");
    }
  }

}