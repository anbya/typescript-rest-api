import bcrypt from "bcrypt";

export const hashPassword = async (
  plainTextPassword: string,
  saltRounds: number = 10
): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error while hashing password");
  }
};

export const validatePassword = async (
  plainTextPassword: string,
  hashedPassword: string
) => {
  try {
    const result = await bcrypt.compare(plainTextPassword, hashedPassword);
    return result
  } catch (error) {
    throw new Error("Error while validating password");
  }
};
