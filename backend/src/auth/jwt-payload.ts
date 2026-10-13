export type TokenType = 'access' | 'socket';

export interface JwtPayload {
  sub: string;
  email: string;
  type?: TokenType;
}
