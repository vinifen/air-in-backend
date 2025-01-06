import { RowDataPacket } from "mysql2";
import DbService from "../services/DbService";

export default class RefreshTokenModel {
  constructor(private dbService: DbService){}

  async insertRefreshToken(token: string, userID: number, iat: number){
    const query = "INSERT INTO refresh_tokens (token, id_users, iat) VALUES (?,?,?)";
    const response: RowDataPacket [] = await this.dbService.getQuery(query, [token, userID, iat]);
    if (response) {
      return { message: "Refresh token inserted successfully", response: response };
    } else {
      throw new Error("Failed to insert refresh token");
    }
  }

  async selectHashRefreshTokenByUserID(userID: number, iat: number){
    const query = "SELECT * FROM refresh_tokens WHERE id_users = ? AND iat = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID, iat]);
    if(response.length === 0){
      throw new Error('User not found');
    }

    const token = response[0];

    return {
      id: token.id,
      token: token.token,
      iat: token.iat,
    };
  }

}