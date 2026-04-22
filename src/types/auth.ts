export interface DecodedJwtPayload {
  iss: string;
  exp: number;
  'cognito:groups'?: string[];
  given_name?: string;
  family_name?: string;
  email?: string;
}
