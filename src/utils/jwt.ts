import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  jwt_secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, jwt_secret, { expiresIn } as SignOptions);

  return token;
};

export const jwtUtils = {
  createToken,
};
