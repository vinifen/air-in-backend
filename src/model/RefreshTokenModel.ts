import { RowDataPacket } from "mysql2";
import DbService from "../services/DbService";

export default class RefreshTokenModel {
  constructor(private dbService: DbService){}

  async insertRefreshToken(token: string, userID: number, publicTokenID: string){
    const query = "INSERT INTO refresh_tokens (token, id_users, public_id) VALUES (?,?,?)";
    if(!token || !userID || !publicTokenID){
      throw new Error('Failed to insert refresh token: Invalid parameters provided.')
    }
    const response: RowDataPacket [] = await this.dbService.getQuery(query, [token, userID, publicTokenID]);

    if (response) {
      return {status: true, message: "Refresh token inserted successfully", response: response };
    } else {
      return {status: false, message: "Failed to insert refresh token", response: response };
    }
  }

  async selectHashRefreshToken(userID: number, publicTokenID: string) {
    if (!userID || !publicTokenID) {
        throw new Error('Failed to select refresh: Invalid parameters provided.');
    }
    
    const query = "SELECT * FROM refresh_tokens WHERE id_users = ? AND public_id = ?";

    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID, publicTokenID]);

    if (response.length === 0) {
      return { status: false, message: "Hash token not found" };
    }

    return {
        status: true,
        tokenID: response[0].id,
        publicTokenID: response[0].public_id,
        token: response[0].token,
    };
  }

  async deleteRefreshToken(userID: number, publicTokenID: string){
    if(!userID || !publicTokenID){
      return {status: false, message: "Failed to delete refresh token: Invalid parameters provided."}
    }
    const hashRT = await this.selectHashRefreshToken(userID, publicTokenID);
    if(hashRT.status === false || !hashRT.token){
      return {status: false, message: hashRT.message}
    }

    const query = "DELETE FROM refresh_tokens WHERE id_users = ? AND public_id = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID, publicTokenID]);
    if (response) {
      return { status: true, message: "Refresh token delete successfully.", response: response };
    } else {
      return {status: false, message: "Failed to delete refresh token."}
    }
  }

  async deleteAllRefreshTokensUser(userID: number){
    if(!userID){
      return {status: false, message: "Failed to delete all refresh token: Invalid parameters provided."}
    }

    const query = "DELETE FROM refresh_tokens WHERE id_users = ?";
    const response: RowDataPacket[] = await this.dbService.getQuery(query, [userID]);
    if (response) {
      return { status: true, message: "Refresh token delete successfully.", response: response };
    } else {
      return {status: false, message: "Failed to delete refresh token."}
    }
  }

}