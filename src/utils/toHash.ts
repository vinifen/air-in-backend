import bcrypt from "bcrypt";

export const toHash = async (item: string) => {
  const hash: string = await bcrypt.hash(item, 10);
  return hash;
}