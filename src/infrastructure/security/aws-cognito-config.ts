const { CLIENT_ID_AWS, SECRET_AWS, USER_POLL_ID_AWS } = process.env

export const cognitoConfig = {
  region: 'sa-east-1',
  userPoolId: USER_POLL_ID_AWS,
  clientId: CLIENT_ID_AWS,
  secret: SECRET_AWS,
}
