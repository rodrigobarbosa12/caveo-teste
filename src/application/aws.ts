import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  SignUpCommand,
  InitiateAuthCommand
} from "@aws-sdk/client-cognito-identity-provider"
import { createHmac } from "crypto"
import { cognitoConfig } from 'src/infrastructure/security/aws-cognito-config'

interface User {
  email: string
  password: string
  name: string
}

export const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region
})

export function generateSecretHash(email: string): string {
  return createHmac("SHA256", cognitoConfig.secret)
    .update(`${email}${cognitoConfig.clientId}`)
    .digest("base64")
}

export async function signUpAWS({ email, password, name }: User) {
  const command = new SignUpCommand({
    ClientId: cognitoConfig.clientId,
    SecretHash: generateSecretHash(email.split("@")[0]),
    Username: email.split("@")[0],
    Password: password,
    UserAttributes: Object
      .entries({ email, name })
      .map(([Name, Value]) => ({ Name, Value })),
  })

  await cognitoClient.send(command)
}

export async function confirmUserAWS(data: { email: string, code: string }) {
  const command = new ConfirmSignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: data.email.split("@")[0],
    ConfirmationCode: data.code,
    SecretHash: generateSecretHash(data.email.split("@")[0]),
  })

  return await cognitoClient.send(command)
}

export async function signInAWS(email: string, password: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email.split("@")[0],
      PASSWORD: password,
      SECRET_HASH: generateSecretHash(email.split("@")[0])
    },
    ClientId: cognitoConfig.clientId,
  })

  const response = await cognitoClient.send(command)
  return response.AuthenticationResult
}
