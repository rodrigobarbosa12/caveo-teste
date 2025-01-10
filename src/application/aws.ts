import { cognito } from 'src/infrastructure/aws/awsConfig'

const USER_POOL_ID = "sa-east-1_XXXXXXXXX"; // Substitua pelo seu User Pool ID
const CLIENT_ID = "xxxxxxxxxxxxxxxxxxxxx"; // Substitua pelo seu App Client ID

export async function signUpAWS(email: string, password: string) {
  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    };

    const result = await cognito.signUp(params).promise();
    return result;
  } catch (error) {
    throw new Error(`Erro no cadastro: ${error.message}`);
  }
};

export async function signInAWS(email: string, password: string) {
  try {
    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const result = await cognito.initiateAuth(params).promise();
    return result.AuthenticationResult;
  } catch (error) {
    throw new Error(`Erro no login: ${error.message}`);
  }
};
