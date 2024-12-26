import { DbService } from "../services/DbService";

export default class LoginControl {
  private database: DbService;
  
  constructor(db: DbService) {
    this.database = db;
  }

  async get() {
    const profileId: number = 1;
  
    const result = await this.database.getExecute(
      "SELECT * FROM profiles WHERE id = ?", 
      [profileId]
    );

    
    return result;
  }

  async post() {
    const username = "teste";
    const password = "teste";
   
    const result = await this.database.getExecute(
      "INSERT INTO profiles (username, password) VALUES (?, ?)",
      [username, password]
    );
    return result;
  }
}
