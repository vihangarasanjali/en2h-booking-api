/**
 * Shape of the payload encoded inside every JWT access token.
 * Keep it minimal — only data needed to identify the user.
 */
export interface JwtPayload {
  /** User UUID */
  sub: string;
  /** User email */
  email: string;
}
