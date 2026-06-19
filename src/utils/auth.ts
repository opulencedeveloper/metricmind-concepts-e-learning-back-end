import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { UserType } from "../auth/enum";

class AuthUtil {
  public hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(12, (err, salt) => {
        if (err) reject(err);
        bcrypt.hash(password, salt, (error, hashed: string) => {
          if (error) reject(error);
          resolve(hashed);
        });
      });
    });
  }

  public comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  public generateAuthToken(userId: any, userType: string, expiresIn: string): string {
    const secret = userType === UserType.Admin ? config.jwt.secretAdmin : config.jwt.secret;

    return jwt.sign(
      { userId, userType },
      secret,
      { expiresIn: expiresIn as any }
    );
  }
}

export const authUtil = new AuthUtil();
