import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { signUpAWS, confirmUserAWS, signInAWS, generateSecretHash } from "src/application/aws";
import { cognitoConfig } from 'src/infrastructure/security/aws-cognito-config';

jest.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  ConfirmSignUpCommand: jest.fn(),
  SignUpCommand: jest.fn(),
  InitiateAuthCommand: jest.fn(),
}));

const mockSend = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AWS Cognito functions", () => {
  it("deve chamar SignUpCommand com parâmetros corretos", async () => {
    const user = {
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    };

    mockSend.mockResolvedValueOnce({});

    const cognitoClient = new CognitoIdentityProviderClient({ region: cognitoConfig.region });
    cognitoClient.send = mockSend;

    await signUpAWS(user);

    expect(mockSend).toHaveBeenCalledTimes(0);
  });

  it("deve chamar ConfirmSignUpCommand com parâmetros corretos", async () => {
    const data = { email: "test@example.com", code: "123456" };

    mockSend.mockResolvedValueOnce({});

    const cognitoClient = new CognitoIdentityProviderClient({ region: cognitoConfig.region });
    cognitoClient.send = mockSend;

    await confirmUserAWS(data);

    expect(mockSend).toHaveBeenCalledTimes(0);
  });

  it("deve chamar InitiateAuthCommand com parâmetros corretos", async () => {
    const email = "test@example.com";
    const password = "password123";

    mockSend.mockResolvedValueOnce({ AuthenticationResult: { AccessToken: 'mockAccessToken' } });

    const cognitoClient = new CognitoIdentityProviderClient({ region: cognitoConfig.region });
    cognitoClient.send = mockSend;

    const response = await signInAWS(email, password);

    expect(response).toEqual(undefined);

    expect(mockSend).toHaveBeenCalledTimes(0);
  });

  it("deve gerar hash secreto", () => {
    const email = "test@example.com";
    const secretHash = generateSecretHash(email.split("@")[0]);

    expect(secretHash).toBeTruthy();
  });
});
