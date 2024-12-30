import UsersModel from "../model/UsersModel";

export default class UserControl {

  constructor(private modelUser: UsersModel) {}

  async getAllUsers() {
    const result = await this.modelUser.selectAllUsers();
    return result;
  }

  async postUser(username: string, password: string) {
    await this.modelUser.insertUser(username, password);
  }
}
