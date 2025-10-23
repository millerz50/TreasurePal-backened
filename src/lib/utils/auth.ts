import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, 10);

export const comparePassword = async (
  candidate: string,
  hashed: string
): Promise<boolean> => bcrypt.compare(candidate, hashed);
